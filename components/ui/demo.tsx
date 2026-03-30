import { SmokeBackground } from '@/components/ui/spooky-smoke-animation'

const Default = () => {
  return <SmokeBackground />
}

const Customized = () => {
  return <SmokeBackground smokeColor="#9a8474" opacity={0.36} />
}

export { Default, Customized }
