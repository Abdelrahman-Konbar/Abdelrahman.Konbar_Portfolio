import { useEffect } from 'react'
import { profile } from '../data/profile'
import { Contact } from '../sections/Contact'
import { Experience } from '../sections/Experience'
import { Expertise } from '../sections/Expertise'
import { Hero } from '../sections/Hero'
import { Philosophy } from '../sections/Philosophy'
import { SelectedWork } from '../sections/SelectedWork'

export function Home() {
  useEffect(() => {
    document.title = `${profile.name} — ${profile.role}`
  }, [])
  return (
    <>
      <Hero />
      <SelectedWork />
      <Expertise />
      <Experience />
      <Philosophy />
      <Contact />
    </>
  )
}
