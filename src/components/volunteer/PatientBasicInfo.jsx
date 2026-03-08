import { useState, useEffect } from 'react'
import { User, Phone, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useScreeningStore } from '@/store'

// Ghanaian phone regex patterns
const GHANA_PHONE_REGEX = /^(\+233|0)[0-9]{9}$/

/**
 * PatientBasicInfo - Patient identity component
 * Non-clinical data: Full Name, Age, Gender, Phone Number
 * Validates Ghanaian phone format (10 digits)
 */
export function PatientBasicInfo() {
  const { screeningFormData, updateFormData } = useScreeningStore()
  const [errors, setErrors] = useState({})
  
  // Local state for form fields
  const [fullName, setFullName] = useState(screeningFormData.full_name || '')
  const [age, setAge] = useState(screeningFormData.age || '')
  const [gender, setGender] = useState(screeningFormData.gender || '')
  const [phoneNumber, setPhoneNumber] = useState(screeningFormData.phone_number || '')

  // Update store when fields change
  useEffect(() => {
    updateFormData({ full_name: fullName })
  }, [fullName, updateFormData])

  useEffect(() => {
    updateFormData({ age: age ? parseInt(age) : null })
  }, [age, updateFormData])

  useEffect(() => {
    updateFormData({ gender })
  }, [gender, updateFormData])

  useEffect(() => {
    updateFormData({ phone_number: phoneNumber })
  }, [phoneNumber, updateFormData])

  // Validate Ghanaian phone number
  const validatePhone = (value) => {
    if (!value) return true // Optional field
    const cleaned = value.replace(/[\s-]/g, '')
    return GHANA_PHONE_REGEX.test(cleaned)
  }

  // Format phone number as user types
  const formatPhoneNumber = (value) => {
    // Remove non-digits
    const cleaned = value.replace(/\D/g, '')
    
    // Handle different formats
    if (cleaned.startsWith('233')) {
      // Already has country code
      if (cleaned.length <= 12) {
        return '+' + cleaned
      }
    } else if (cleaned.startsWith('0')) {
      // Has leading zero
      if (cleaned.length <= 10) {
        return cleaned
      }
    } else {
      // Just digits - add leading zero
      if (cleaned.length <= 9) {
        return '0' + cleaned
      }
    }
    return value
  }

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
    
    // Validate
    if (formatted && !validatePhone(formatted)) {
      setErrors(prev => ({ ...prev, phoneNumber: 'Invalid Ghanaian phone format (e.g., 0245123456)' }))
    } else {
      setErrors(prev => ({ ...prev, phoneNumber: null }))
    }
  }

  const handleAgeChange = (e) => {
    const value = e.target.value
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      const numAge = parseInt(value)
      if (value === '' || (numAge >= 1 && numAge <= 120)) {
        setAge(value)
        setErrors(prev => ({ ...prev, age: null }))
      } else {
        setErrors(prev => ({ ...prev, age: 'Age must be between 1 and 120' }))
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Patient Information
        </CardTitle>
        <CardDescription>
          Enter the patient's basic details
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="fullName"
              placeholder="Enter patient's full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        {/* Age and Gender Row - Responsive */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Age */}
          <div className="space-y-2">
            <Label htmlFor="age">Age *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="age"
                type="text"
                inputMode="numeric"
                placeholder="Years"
                value={age}
                onChange={handleAgeChange}
                className="pl-10"
                required
              />
            </div>
            {errors.age && (
              <p className="text-xs text-destructive">{errors.age}</p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label>Gender *</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={gender === 'Male' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setGender('Male')}
                className="flex-1"
              >
                Male
              </Button>
              <Button
                type="button"
                variant={gender === 'Female' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setGender('Female')}
                className="flex-1"
              >
                Female
              </Button>
            </div>
          </div>
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number (Optional)</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="0245123456"
              value={phoneNumber}
              onChange={handlePhoneChange}
              className="pl-10"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Ghana format: 0245123456 or +233245123456
          </p>
          {errors.phoneNumber && (
            <p className="text-xs text-destructive">{errors.phoneNumber}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default PatientBasicInfo
