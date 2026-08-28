import { useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import type { AppProps } from '../../../app/types'
import { Preferences } from '../../../components/preferences/Preferences'
import { Field, FormSection, PageHeader } from '../../../components/shared/Primitives'
import '../StudentPages.css'

function StudentProfileForm(props: AppProps) {
  const [profile, setProfile] = useState(props.db.profile)
  const campusOptions = Array.from(
    new Map(props.db.locations.filter((location) => location.active && location.campusId).map((location) => [location.campusId, location])).values(),
  )

  return (
    <div className="page narrow-page">
      <PageHeader eyebrow="Account" title="Profile & notifications" description="Keep your contact details current so agents can follow up." />
      <form onSubmit={(e) => { e.preventDefault(); props.mutate('Profile saved', (draft) => { draft.profile = profile }) }}>
        <FormSection title="Personal information" description="Used when you send an inquiry.">
          <div className="form-grid">
            <Field label="Full name"><input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></Field>
            <Field label="Email address"><input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></Field>
            <Field label="Phone number"><input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></Field>
            <Field label="WhatsApp"><input value={profile.whatsapp} onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })} /></Field>
            <Field label="Primary campus"><select value={profile.campusId} onChange={(e) => { const campus = campusOptions.find((item) => item.campusId === e.target.value); setProfile({ ...profile, campusId: e.target.value, campus: campus?.campus ?? '' }) }}><option value="">Select campus</option>{campusOptions.map((location) => <option key={location.campusId} value={location.campusId}>{location.campus}</option>)}</select></Field>
          </div>
        </FormSection>
        <Preferences db={props.db} mutate={props.mutate} />
        <div className="form-actions"><button className="btn primary" disabled={props.busy}>{props.busy && <LoaderCircle className="spin" />}Save profile</button></div>
      </form>
    </div>
  )
}

export function StudentProfile(props: AppProps) {
  if (!props.db.profile.email) {
    return <div className="page narrow-page"><LoaderCircle className="spin" /></div>
  }
  const profile = props.db.profile
  const profileKey = `${profile.email}:${profile.name}:${profile.phone}:${profile.whatsapp}:${profile.campusId}`
  return <StudentProfileForm key={profileKey} {...props} />
}
