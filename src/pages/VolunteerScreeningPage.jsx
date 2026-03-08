import { Activity } from 'lucide-react'
import { IntakeHeader } from '@/components/volunteer/IntakeHeader'
import { PatientBasicInfo } from '@/components/volunteer/PatientBasicInfo'
import { VitalsGrid } from '@/components/volunteer/VitalsGrid'
import { LiveResultCard } from '@/components/volunteer/LiveResultCard'
import { SubmissionGuard } from '@/components/volunteer/SubmissionGuard'

/**
 * VolunteerScreeningPage - Main volunteer screening page
 * Combines all volunteer components into a cohesive form
 */
export function VolunteerScreeningPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Activity className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">HealthTrace</h1>
            <p className="text-sm text-primary-foreground/80">Community Health Screening</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Session Info */}
        <div className="mb-6">
          <IntakeHeader />
        </div>

        {/* Main Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Basic Info */}
            <PatientBasicInfo />

            {/* Vitals Grid */}
            <VitalsGrid />
          </div>

          {/* Right Column - Live Results */}
          <div className="lg:col-span-1">
            <LiveResultCard />
          </div>
        </div>

        {/* Submission Footer */}
        <div className="mt-6">
          <SubmissionGuard />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-sm text-muted-foreground border-t">
        <p>HealthTrace © {new Date().getFullYear()} - Community Health Screening Platform</p>
        <p className="text-xs mt-1">Powered by Django REST API</p>
      </footer>
    </div>
  )
}

export default VolunteerScreeningPage
