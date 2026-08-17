import { useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import type { AppProps } from '../../../app/types'
import { Preferences } from '../../../components/preferences/Preferences'
import { Field, FormSection, PageHeader } from '../../../components/shared/Primitives'
import '../StudentPages.css'

export function StudentProfile(props: AppProps) {
  const [profile, setProfile] = useState(props.db.profile)
  const campusOptions = [...new Set(props.db.locations.map((location) => location.campus).filter(Boolean))]

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
            <Field label="Primary campus"><select value={profile.campus} onChange={(e) => setProfile({ ...profile, campus: e.target.value })}><option value="">Select campus</option>{campusOptions.map((campus) => <option key={campus}>{campus}</option>)}</select></Field>
          </div>
        </FormSection>
        <Preferences db={props.db} mutate={props.mutate} />
        <div className="form-actions"><button className="btn primary" disabled={props.busy}>{props.busy && <LoaderCircle className="spin" />}Save profile</button></div>
      </form>
    </div>
  )
}
