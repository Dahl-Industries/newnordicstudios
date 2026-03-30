import React, { useEffect, useRef } from 'react'

const fragmentShaderSource = `#version 300 es
precision highp float;
out vec4 O;
uniform float time;
uniform vec2 resolution;
uniform vec3 u_color;
uniform float u_opacity;

#define FC gl_FragCoord.xy
#define R resolution
#define T (time + 660.0)

float rnd(vec2 p){p=fract(p*vec2(12.9898,78.233));p+=dot(p,p+34.56);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);return mix(mix(rnd(i),rnd(i+vec2(1.0,0.0)),u.x),mix(rnd(i+vec2(0.0,1.0)),rnd(i+vec2(1.0,1.0)),u.x),u.y);}
float fbm(vec2 p){float t=0.0,a=1.0;for(int i=0;i<5;i++){t+=a*noise(p);p*=mat2(1.0,-1.2,0.2,1.2)*2.0;a*=0.5;}return t;}

void main(){
  vec2 uv=(FC-.5*R)/R.y;
  uv.x+=.2;
  uv*=vec2(2.0,1.0);

  float n=fbm(uv*.28-vec2(T*.01,0.0));
  n=noise(uv*3.0+n*2.0);

  vec3 col=vec3(1.0);
  col.r-=fbm(uv+vec2(0.0,T*.015)+n);
  col.g-=fbm(uv*1.003+vec2(0.0,T*.015)+n+.003);
  col.b-=fbm(uv*1.006+vec2(0.0,T*.015)+n+.006);

  float smoke = 1.0 - clamp(dot(col,vec3(.21,.71,.07)), 0.0, 1.0);
  smoke = smoothstep(0.18, 0.92, smoke);

  vec3 tint = mix(u_color * 0.82, u_color, smoke);
  O=vec4(tint, smoke * u_opacity);
}`

class Renderer {
  private readonly vertexSrc = `#version 300 es
precision highp float;
in vec4 position;
void main(){gl_Position=position;}`

  private readonly vertices = [-1, 1, -1, -1, 1, 1, 1, -1]

  private gl: WebGL2RenderingContext
  private canvas: HTMLCanvasElement
  private program: WebGLProgram | null = null
  private vs: WebGLShader | null = null
  private fs: WebGLShader | null = null
  private buffer: WebGLBuffer | null = null
  private color: [number, number, number] = [0.55, 0.5, 0.46]
  private opacity = 0.34

  constructor(canvas: HTMLCanvasElement, fragmentSource: string) {
    this.canvas = canvas
    this.gl = canvas.getContext('webgl2', { alpha: true, antialias: true }) as WebGL2RenderingContext
    this.setup(fragmentSource)
    this.init()
  }

  updateColor(newColor: [number, number, number]) {
    this.color = newColor
  }

  updateOpacity(opacity: number) {
    this.opacity = opacity
  }

  updateScale() {
    const dpr = Math.max(1, window.devicePixelRatio || 1)
    const rect = this.canvas.getBoundingClientRect()
    const width = Math.max(1, Math.round(rect.width * dpr))
    const height = Math.max(1, Math.round(rect.height * dpr))
    this.canvas.width = width
    this.canvas.height = height
    this.gl.viewport(0, 0, width, height)
  }

  private compile(shader: WebGLShader, source: string) {
    const gl = this.gl
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(`Shader compilation error: ${gl.getShaderInfoLog(shader)}`)
    }
  }

  reset() {
    const { gl, program, vs, fs, buffer } = this
    if (buffer) gl.deleteBuffer(buffer)
    if (!program) return
    if (vs) {
      gl.detachShader(program, vs)
      gl.deleteShader(vs)
    }
    if (fs) {
      gl.detachShader(program, fs)
      gl.deleteShader(fs)
    }
    gl.deleteProgram(program)
    this.program = null
  }

  private setup(fragmentSource: string) {
    const gl = this.gl
    this.vs = gl.createShader(gl.VERTEX_SHADER)
    this.fs = gl.createShader(gl.FRAGMENT_SHADER)
    const program = gl.createProgram()
    if (!this.vs || !this.fs || !program) return
    this.compile(this.vs, this.vertexSrc)
    this.compile(this.fs, fragmentSource)
    this.program = program
    gl.attachShader(program, this.vs)
    gl.attachShader(program, this.fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(`Program linking error: ${gl.getProgramInfoLog(program)}`)
    }
  }

  private init() {
    const { gl, program } = this
    if (!program) return
    this.buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    Object.assign(program, {
      resolution: gl.getUniformLocation(program, 'resolution'),
      time: gl.getUniformLocation(program, 'time'),
      u_color: gl.getUniformLocation(program, 'u_color'),
      u_opacity: gl.getUniformLocation(program, 'u_opacity'),
    })
  }

  render(now = 0) {
    const { gl, program, buffer, canvas } = this
    if (!program || !buffer || !gl.isProgram(program)) return
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.uniform2f((program as any).resolution, canvas.width, canvas.height)
    gl.uniform1f((program as any).time, now * 1e-3)
    gl.uniform3fv((program as any).u_color, this.color)
    gl.uniform1f((program as any).u_opacity, this.opacity)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
}

const hexToRgb = (hex: string): [number, number, number] | null => {
  const value = hex.replace('#', '').trim()
  const normalized = value.length === 3 ? value.split('').map((c) => c + c).join('') : value
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized)
  return result
    ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255,
      ]
    : null
}

interface SmokeBackgroundProps {
  smokeColor?: string
  opacity?: number
}

export const SmokeBackground: React.FC<SmokeBackgroundProps> = ({
  smokeColor = '#9a8474',
  opacity = 0.34,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<Renderer | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return undefined
    const canvas = canvasRef.current
    const renderer = new Renderer(canvas, fragmentShaderSource)
    rendererRef.current = renderer

    const handleResize = () => renderer.updateScale()
    handleResize()
    window.addEventListener('resize', handleResize)

    let animationFrameId = 0
    const loop = (now: number) => {
      renderer.render(now)
      animationFrameId = window.requestAnimationFrame(loop)
    }
    animationFrameId = window.requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.cancelAnimationFrame(animationFrameId)
      renderer.reset()
    }
  }, [])

  useEffect(() => {
    const renderer = rendererRef.current
    if (!renderer) return
    const rgbColor = hexToRgb(smokeColor)
    if (rgbColor) renderer.updateColor(rgbColor)
    renderer.updateOpacity(opacity)
  }, [opacity, smokeColor])

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
}
