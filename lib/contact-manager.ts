import { kvClient } from '@/lib/kv-client'

export interface Contact {
  email: string
  name?: string
  source: string // e.g., 'business-card', 'website-signup', 'referral'
  tags: string[] // e.g., ['ai-interested', 'premium-prospect']
  firstContact: string // ISO date string
  lastContact?: string // ISO date string
  contactCount: number
  campaigns: Array<{
    campaignId: string
    campaignName: string
    sentAt: string
    status: 'sent' | 'bounced' | 'unsubscribed'
  }>
  notes?: string
}

export interface Campaign {
  id: string
  name: string
  description: string
  createdAt: string
  sentCount: number
  templateUsed: string
  status: 'draft' | 'sent' | 'scheduled'
}

// Contact Management Functions
export async function addContact(contact: Omit<Contact, 'firstContact' | 'contactCount' | 'campaigns'>): Promise<void> {
  const existing = await getContact(contact.email)
  if (existing) {
    // Update existing contact
    existing.tags = [...new Set([...existing.tags, ...contact.tags])]
    if (contact.name && !existing.name) existing.name = contact.name
    if (contact.notes) existing.notes = contact.notes
    await kvClient.put(`contact:${contact.email}`, JSON.stringify(existing))
  } else {
    // Create new contact
    const newContact: Contact = {
      ...contact,
      firstContact: new Date().toISOString(),
      contactCount: 0,
      campaigns: []
    }
    await kvClient.put(`contact:${contact.email}`, JSON.stringify(newContact))
  }
}

export async function getContact(email: string): Promise<Contact | null> {
  const raw = await kvClient.get(`contact:${email}`)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch (err) {
    console.error('Failed to parse contact data for', email, err)
    return null
  }
}

export async function updateContactAfterSend(email: string, campaignId: string, campaignName: string): Promise<void> {
  const contact = await getContact(email)
  if (!contact) return

  contact.lastContact = new Date().toISOString()
  contact.contactCount += 1
  contact.campaigns.push({
    campaignId,
    campaignName,
    sentAt: new Date().toISOString(),
    status: 'sent'
  })

  await kvClient.put(`contact:${email}`, JSON.stringify(contact))
}

export async function getAllContacts(): Promise<Contact[]> {
  // Note: This is a simplified implementation
  // In a real system, you'd want to use KV's list functionality or maintain an index
  // For now, we'll return an empty array as this would require more complex implementation
  console.warn('getAllContacts not fully implemented - would need KV list functionality')
  return []
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function searchContacts(_query: string): Promise<Contact[]> {
  // Simplified search - in production, you'd want a proper search index
  console.warn('searchContacts not fully implemented')
  return []
}

// Campaign Management Functions
export async function createCampaign(campaign: Omit<Campaign, 'id' | 'createdAt' | 'sentCount'>): Promise<string> {
  const id = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const newCampaign: Campaign = {
    ...campaign,
    id,
    createdAt: new Date().toISOString(),
    sentCount: 0
  }
  await kvClient.put(`campaign:${id}`, JSON.stringify(newCampaign))
  return id
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  const raw = await kvClient.get(`campaign:${id}`)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch (err) {
    console.error('Failed to parse campaign data for', id, err)
    return null
  }
}

export async function updateCampaignSentCount(campaignId: string, sentCount: number): Promise<void> {
  const campaign = await getCampaign(campaignId)
  if (!campaign) return

  campaign.sentCount = sentCount
  campaign.status = 'sent'
  await kvClient.put(`campaign:${campaignId}`, JSON.stringify(campaign))
}

// Bulk Operations
export async function addContactsFromEmails(
  emails: string[],
  source: string,
  tags: string[] = [],
  campaignId?: string,
  campaignName?: string
): Promise<{ added: number; updated: number; errors: string[] }> {
  let added = 0
  let updated = 0
  const errors: string[] = []

  for (const email of emails) {
    try {
      const contactData = {
        email: email.trim(),
        source,
        tags
      }

      const existing = await getContact(email.trim())
      if (existing) {
        updated++
      } else {
        added++
      }

      await addContact(contactData)

      // If this is part of a campaign, update the contact
      if (campaignId && campaignName) {
        await updateContactAfterSend(email.trim(), campaignId, campaignName)
      }
    } catch (err) {
      errors.push(`Failed to process ${email}: ${err}`)
    }
  }

  return { added, updated, errors }
}

// Analytics
export async function getContactStats(): Promise<{
  totalContacts: number
  contactsBySource: Record<string, number>
  contactsByTag: Record<string, number>
  recentCampaigns: Campaign[]
}> {
  // This would require maintaining indexes in KV
  // For now, return placeholder data
  return {
    totalContacts: 0,
    contactsBySource: {},
    contactsByTag: {},
    recentCampaigns: []
  }
}