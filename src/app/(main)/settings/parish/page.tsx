'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormField } from '@/components/form-field'
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PageContainer } from '@/components/page-container'
import { Save, Church, RefreshCw, Users, Mail, MoreVertical, Trash2, UserCog, Settings } from "lucide-react"
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { getCurrentParish } from '@/lib/auth/parish'
import { updateParish, getParishMembers, inviteParishMember, removeParishMember, updateMemberRole } from '@/lib/actions/setup'
import { Parish } from '@/lib/types'
import { toast } from 'sonner'

interface ParishMember {
  user_id: string
  roles: string[]
  users: {
    id: string
    email: string | null
    full_name: string | null
    created_at: string | null
  } | null
}

export default function ParishSettingsPage() {
  const [currentParish, setCurrentParish] = useState<Parish | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    state: ''
  })
  const [members, setMembers] = useState<ParishMember[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [loadingMembers, setLoadingMembers] = useState(false)
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Settings", href: "/settings" },
      { label: "Parish Settings" }
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    loadParishData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadParishData() {
    try {
      setLoading(true)
      const parish = await getCurrentParish()
      if (parish) {
        setCurrentParish(parish)
        setFormData({
          name: parish.name,
          city: parish.city,
          state: parish.state
        })
        await loadMembers(parish.id)
      }
    } catch (error) {
      console.error('Error loading parish data:', error)
      toast.error('Failed to load parish data')
    } finally {
      setLoading(false)
    }
  }

  async function loadMembers(parishId: string) {
    try {
      setLoadingMembers(true)
      const result = await getParishMembers(parishId)
      setMembers(result.members || [])
    } catch (error) {
      console.error('Error loading members:', error)
      toast.error('Failed to load parish members')
    } finally {
      setLoadingMembers(false)
    }
  }

  const handleSave = async () => {
    if (!currentParish) {
      toast.error('No parish selected')
      return
    }

    if (!formData.name.trim() || !formData.city.trim() || !formData.state.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setSaving(true)
    try {
      await updateParish(currentParish.id, formData)
      toast.success('Parish settings saved successfully!')
      
      // Refresh parish data
      await loadParishData()
    } catch (error) {
      console.error('Error saving parish settings:', error)
      toast.error('Failed to save parish settings')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleRefresh = () => {
    loadParishData()
  }

  const handleInviteMember = async () => {
    if (!currentParish) {
      toast.error('No parish selected')
      return
    }

    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address')
      return
    }

    setInviting(true)
    try {
      const result = await inviteParishMember(currentParish.id, inviteEmail, [inviteRole])
      toast.success(result.message)
      
      // Clear form and reload members if user was added
      setInviteEmail('')
      setInviteRole('member')
      if (result.userExists) {
        await loadMembers(currentParish.id)
      }
    } catch (error) {
      console.error('Error inviting member:', error)
      toast.error('Failed to invite member')
    } finally {
      setInviting(false)
    }
  }

  const handleRemoveMember = async (userId: string, email: string) => {
    if (!currentParish) return

    if (confirm(`Are you sure you want to remove ${email} from the parish?`)) {
      try {
        await removeParishMember(currentParish.id, userId)
        toast.success('Member removed successfully')
        await loadMembers(currentParish.id)
      } catch (error) {
        console.error('Error removing member:', error)
        toast.error('Failed to remove member')
      }
    }
  }

  const handleUpdateRole = async (userId: string, newRoles: string[]) => {
    if (!currentParish) return

    try {
      await updateMemberRole(currentParish.id, userId, newRoles)
      toast.success('Member role updated successfully')
      await loadMembers(currentParish.id)
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Failed to update member role')
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'minister': return 'bg-blue-100 text-blue-800'
      case 'lector': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <PageContainer
        title="Parish Settings"
        description="Manage your parish information and administrative settings"
        maxWidth="4xl"
      >
        <div className="space-y-6">Loading parish settings...</div>
      </PageContainer>
    )
  }

  if (!currentParish) {
    return (
      <PageContainer
        title="Parish Settings"
        description="Manage your parish information and administrative settings"
        maxWidth="4xl"
      >
        <Card>
          <CardContent className="text-center py-12">
            <Church className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Parish Selected</h3>
            <p className="text-muted-foreground">
              Please select a parish to manage its settings.
            </p>
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="Parish Settings"
      description="Manage your parish information, members, and administrative settings"
      maxWidth="6xl"
    >
      <div className="flex justify-end mb-6 gap-3">
        <Button onClick={handleRefresh} variant="outline" disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Parish Settings
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members ({members.length})
          </TabsTrigger>
          <TabsTrigger value="invite" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Invite Member
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <div className="flex justify-end mb-4">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Church className="h-5 w-5" />
                Parish Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <FormField
                    id="name"
                    label="Parish Name"
                    value={formData.name}
                    onChange={(value) => handleChange('name', value)}
                    placeholder="St. Mary's Catholic Church"
                    required
                  />
                </div>

                <div>
                  <FormField
                    id="city"
                    label="City"
                    value={formData.city}
                    onChange={(value) => handleChange('city', value)}
                    placeholder="New York"
                    required
                  />
                </div>

                <div>
                  <FormField
                    id="state"
                    label="State"
                    value={formData.state}
                    onChange={(value) => handleChange('state', value)}
                    placeholder="NY"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Parish Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Parish ID</Label>
                <p className="mt-1 text-sm font-mono text-muted-foreground">{currentParish.id}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                <p className="mt-1 text-sm">{new Date(currentParish.created_at).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="h-5 w-5" />
                Parish Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingMembers ? (
                <div className="text-center py-8">Loading members...</div>
              ) : members.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No members found
                </div>
              ) : (
                <div className="space-y-4">
                  {members.map((member) => (
                    <div key={member.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">
                          {member.users?.full_name || member.users?.email || `User ${member.user_id.substring(0, 8)}...`}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {member.users?.email && member.users?.full_name && member.users.email !== member.users.full_name
                            ? member.users.email
                            : member.users?.created_at 
                              ? `Member since ${new Date(member.users.created_at).toLocaleDateString()}`
                              : `User ID: ${member.user_id}`
                          }
                        </div>
                        <div className="flex gap-1 mt-2">
                          {member.roles.map((role) => (
                            <Badge key={role} className={getRoleColor(role)}>
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleUpdateRole(member.user_id, ['admin'])}
                            disabled={member.roles.includes('admin')}
                          >
                            <UserCog className="h-4 w-4 mr-2" />
                            Make Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleUpdateRole(member.user_id, ['member'])}
                            disabled={member.roles.length === 1 && member.roles.includes('member')}
                          >
                            <UserCog className="h-4 w-4 mr-2" />
                            Make Member
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleRemoveMember(member.user_id, member.users?.email || 'Unknown')}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invite" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Mail className="h-5 w-5" />
                Invite New Member
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <FormField
                  id="invite-email"
                  label="Email Address"
                  inputType="email"
                  value={inviteEmail}
                  onChange={(value) => setInviteEmail(value)}
                  placeholder="member@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="invite-role" className="text-sm font-medium">
                  Initial Role
                </Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="minister">Minister</SelectItem>
                    <SelectItem value="lector">Lector</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <Button onClick={handleInviteMember} disabled={inviting}>
                  <Mail className="h-4 w-4 mr-2" />
                  {inviting ? 'Inviting...' : 'Send Invitation'}
                </Button>
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">How it works:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• If the email belongs to an existing user, they&apos;ll be added immediately</li>
                  <li>• If the email is new, an invitation will be sent (feature coming soon)</li>
                  <li>• Only parish admins can invite new members</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}