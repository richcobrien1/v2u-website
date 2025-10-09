import { NextRequest, NextResponse } from 'next/server'
import { createCampaign, updateCampaignSentCount, addContactsFromEmails } from '@/lib/contact-manager'

type CreateCampaignRequest = {
  action: 'createCampaign'
  name: string
  description: string
  templateUsed: string
  status?: 'draft' | 'sent' | 'scheduled'
}

type UpdateCampaignSentCountRequest = {
  action: 'updateCampaignSentCount'
  campaignId: string
  sentCount: number
}

type AddContactsFromEmailsRequest = {
  action: 'addContactsFromEmails'
  emails: string[]
  source: string
  tags: string[]
  campaignId?: string
  campaignName?: string
}

type ContactManagementRequest = CreateCampaignRequest | UpdateCampaignSentCountRequest | AddContactsFromEmailsRequest

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ContactManagementRequest

    switch (body.action) {
      case 'createCampaign': {
        const { name, description, templateUsed, status } = body
        const campaignId = await createCampaign({
          name,
          description,
          templateUsed,
          status: status || 'draft'
        })
        return NextResponse.json({ campaignId })
      }

      case 'updateCampaignSentCount': {
        const { campaignId, sentCount } = body
        await updateCampaignSentCount(campaignId, sentCount)
        return NextResponse.json({ success: true })
      }

      case 'addContactsFromEmails': {
        const { emails, source, tags, campaignId, campaignName } = body
        const result = await addContactsFromEmails(emails, source, tags, campaignId, campaignName)
        return NextResponse.json(result)
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Contact management API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}