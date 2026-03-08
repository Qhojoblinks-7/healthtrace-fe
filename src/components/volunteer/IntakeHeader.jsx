import { useState } from 'react'
import { MapPin, User, Settings, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSessionStore } from '@/store'

// Common screening locations in Ghana
const GHANA_LOCATIONS = [
  'Makola Market',
  'Accra Central',
  'Tema Community',
  'Kumasi Central',
  'Takoradi Market',
  'Cape Coast',
  'Tamale Central',
  'Koforidua',
  'Sunyani',
  'Ho',
]

/**
 * IntakeHeader - Volunteer session display component
 * Shows current location and volunteer name from Zustand store
 * Includes "Change Location" feature to update global state
 * Mobile responsive
 */
export function IntakeHeader() {
  const { volunteerName, location, setLocation, setVolunteerName } = useSessionStore()
  const [isEditing, setIsEditing] = useState(false)
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [tempLocation, setTempLocation] = useState(location)
  const [tempName, setTempName] = useState(volunteerName)

  const handleSave = () => {
    setLocation(tempLocation)
    setVolunteerName(tempName)
    setIsEditing(false)
  }

  const handleLocationSelect = (loc) => {
    setTempLocation(loc)
    setShowLocationDropdown(false)
  }

  if (!location && !volunteerName) {
    // Show setup mode if no session info
    return (
      <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-primary">
            <User className="h-5 w-5" />
            Start Screening Session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="volunteerName">Your Name</Label>
            <Input
              id="volunteerName"
              placeholder="Enter volunteer name"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Screening Location</Label>
            <div className="relative">
              <Input
                id="location"
                placeholder="Search location..."
                value={tempLocation}
                onChange={(e) => {
                  setTempLocation(e.target.value)
                  setShowLocationDropdown(true)
                }}
                onFocus={() => setShowLocationDropdown(true)}
              />
              {showLocationDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-auto">
                  {GHANA_LOCATIONS.filter(loc => 
                    loc.toLowerCase().includes(tempLocation.toLowerCase())
                  ).map((loc) => (
                    <button
                      key={loc}
                      className="w-full px-3 py-2 text-left hover:bg-primary/10 flex items-center gap-2"
                      onClick={() => handleLocationSelect(loc)}
                    >
                      <MapPin className="h-4 w-4 text-primary" />
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <Button 
            onClick={handleSave} 
            disabled={!tempLocation || !tempName}
            className="w-full"
          >
            <Check className="h-4 w-4 mr-2" />
            Start Session
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-border bg-gradient-to-r from-primary/5 to-primary/10">
      <CardContent className="py-3 sm:py-4">
        {/* Mobile: Stack vertically, Desktop: Horizontal layout */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          {/* Session Info - Mobile: vertical, Desktop: horizontal */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
            {/* Location */}
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Location
                </p>
                <p className="font-semibold text-foreground text-sm sm:text-base">
                  {location || 'Not set'}
                </p>
              </div>
            </div>
            
            {/* Divider - Hidden on mobile */}
            <div className="hidden sm:block h-10 w-px bg-border" />
            
            {/* Volunteer Name */}
            <div className="flex items-center gap-2">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Volunteer
                </p>
                <p className="font-semibold text-foreground text-sm sm:text-base">
                  {volunteerName || 'Not set'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Change Button */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="w-full sm:w-auto"
          >
            <Settings className="h-4 w-4 mr-2" />
            <span className="sm:hidden">Edit</span>
            <span className="hidden sm:inline">{isEditing ? 'Cancel' : 'Change'}</span>
          </Button>
        </div>
        
        {/* Edit Mode */}
        {isEditing && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label>Volunteer Name</Label>
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={tempLocation}
                onChange={(e) => setTempLocation(e.target.value)}
                placeholder="Search location..."
                list="locations-edit"
              />
              <datalist id="locations-edit">
                {GHANA_LOCATIONS.map(loc => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>
            </div>
            <Button 
              className="col-span-1 sm:col-span-2" 
              onClick={handleSave}
              disabled={!tempLocation || !tempName}
            >
              Save Changes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default IntakeHeader
