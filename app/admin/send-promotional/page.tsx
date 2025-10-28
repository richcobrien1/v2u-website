"use client"
import React, { useEffect, useState } from 'react'
import { adminFetch } from '@/components/AdminClient'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AdminSendPromotionalPage() {
  const [html, setHtml] = useState('')
  const [originalHtml, setOriginalHtml] = useState('')
  const [emails, setEmails] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [previewExpanded, setPreviewExpanded] = useState(false)
  const [emailLog, setEmailLog] = useState<Array<{
    timestamp: string
    recipientCount: number
    recipients: string[]
    status: 'success' | 'partial' | 'failed'
    campaignId?: string
    campaignName?: string
    contactsAdded?: number
    contactsUpdated?: number
  }>>([])

  // Load email log from localStorage on mount
  useEffect(() => {
    const savedLog = localStorage.getItem('promotional-email-log')
    if (savedLog) {
      try {
        setEmailLog(JSON.parse(savedLog))
      } catch (err) {
        console.error('Failed to parse email log:', err)
      }
    }
  }, [])

  // Save email log to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('promotional-email-log', JSON.stringify(emailLog))
  }, [emailLog])

  // Load the promotional template on mount
  useEffect(() => {
    loadPromotionalTemplate()
  }, [])

  // Track changes
  useEffect(() => {
    setHasUnsavedChanges(html !== originalHtml)
  }, [html, originalHtml])

  async function loadPromotionalTemplate() {
    setMessage('')
    try {
      const resp = await adminFetch('/api/admin/email-promotional-template')
      const json = await resp.json() as { html?: string; error?: string }
      if (!resp.ok) {
        setMessage(json?.error || 'Failed to load promotional template')
        return
      }
      setHtml(json.html || '')
      setOriginalHtml(json.html || '')
      setMessage('Promotional template loaded successfully')
    } catch (err) {
      setMessage('Network error when loading template')
      console.error('Load template error:', err)
    }
  }

  async function savePromotionalTemplate() {
    setMessage('')
    try {
      const resp = await adminFetch('/api/admin/email-promotional-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html }),
      })
      const json = await resp.json() as { error?: string; success?: boolean }
      if (!resp.ok) {
        setMessage(json.error || 'Failed to save template')
        return
      }
      setOriginalHtml(html)
      setMessage('Promotional template saved successfully! ✅')
    } catch (err) {
      setMessage('Network error when saving template')
      console.error('Save template error:', err)
    }
  }

  async function sendPromotionalEmails() {
    if (!emails.trim()) {
      setMessage('Please enter email addresses')
      return
    }

    if (!html.trim()) {
      setMessage('No email template loaded')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const emailList = emails.split(',').map(email => email.trim()).filter(email => email)
      if (emailList.length === 0) {
        setMessage('No valid email addresses found')
        setIsLoading(false)
        return
      }

      // Create a campaign record
      const campaignResp = await adminFetch('/api/admin/contact-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createCampaign',
          name: `Promotional Campaign - ${new Date().toLocaleDateString()}`,
          description: `Business card promotional emails sent to ${emailList.length} contacts`,
          templateUsed: 'email_promotional_template.html',
          status: 'draft'
        }),
      })
      const campaignData = await campaignResp.json() as { campaignId?: string; error?: string }
      if (!campaignResp.ok) {
        setMessage(campaignData.error || 'Failed to create campaign')
        setIsLoading(false)
        return
      }
      const campaignId = campaignData.campaignId!

      const resp = await adminFetch('/api/admin/send-promotional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: emailList,
          html: html
        }),
      })

      const json = await resp.json() as { error?: string; sentCount?: number; success?: boolean }
      if (!resp.ok) {
        setMessage(json.error || 'Failed to send emails')
        setIsLoading(false)
        return
      }

      // Update campaign with sent count
      await adminFetch('/api/admin/contact-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateCampaignSentCount',
          campaignId,
          sentCount: json.sentCount || 0
        }),
      })

      // Add contacts to the contact management system
      const contactResp = await adminFetch('/api/admin/contact-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addContactsFromEmails',
          emails: emailList,
          source: 'business-card',
          tags: ['promotional-campaign', 'ai-interested'],
          campaignId,
          campaignName: `Promotional Campaign - ${new Date().toLocaleDateString()}`
        }),
      })
      const contactResult = await contactResp.json() as { added: number; updated: number; errors: string[] }
      if (!contactResp.ok) {
        console.error('Failed to add contacts:', contactResult)
        // Continue anyway - email was sent successfully
      }

      setMessage(`Successfully sent ${json.sentCount || 0} promotional emails and added ${contactResult.added} new contacts to the database!`)
      setEmails('') // Clear the email list after successful send

      // Log the successful send with campaign info
      const newLogEntry = {
        timestamp: new Date().toISOString(),
        recipientCount: json.sentCount || 0,
        recipients: emailList,
        status: 'success' as const,
        campaignId,
        campaignName: `Promotional Campaign - ${new Date().toLocaleDateString()}`,
        contactsAdded: contactResult.added,
        contactsUpdated: contactResult.updated
      }
      setEmailLog(prev => [newLogEntry, ...prev].slice(0, 50)) // Keep last 50 entries
    } catch (err) {
      setMessage('Network error when sending emails')
      console.error('Send emails error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-(--site-bg) text-(--site-fg)">
      <Header />

      <div className="p-6 pt-24 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Send Promotional Emails</h1>
          <a
            href="/admin/dashboard"
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
          >
            ← Back to Dashboard
          </a>
        </div>

        <div className="flex gap-3 mb-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={loadPromotionalTemplate}
          >
            Load Template
          </button>
          <button
            className={`px-4 py-2 rounded ${
              hasUnsavedChanges
                ? 'bg-orange-600 hover:bg-orange-700'
                : 'bg-gray-600 hover:bg-gray-700'
            } text-white`}
            onClick={savePromotionalTemplate}
            disabled={!hasUnsavedChanges}
          >
            {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            onClick={sendPromotionalEmails}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Emails'}
          </button>
        </div>

        {message && (
          <div className={`mb-4 rounded-xl p-4 ${
            message.includes('successfully') || message.includes('Successfully')
              ? 'bg-green-100 text-green-800 border border-green-200'
              : message.includes('error') || message.includes('Error')
              ? 'bg-red-100 text-red-800 border border-red-200'
              : 'bg-blue-100 text-blue-800 border border-blue-200'
          }`}>
            {message}
          </div>
        )}

        <div className="mb-6 rounded-xl bg-[#dfdfdfff] text-black p-4">
          <label className="block mb-2 font-semibold">
            Email Addresses (comma separated)
          </label>
          <textarea
            className="w-full h-32 p-3 border rounded font-mono text-sm"
            value={emails}
            onChange={e => setEmails(e.target.value)}
            placeholder="email1@example.com, email2@example.com, email3@example.com"
          />
          <p className="text-sm text-gray-600 mt-2">
            Enter email addresses separated by commas. Each email will receive the promotional template.
          </p>
        </div>

        <div className="mb-6 rounded-xl bg-[#dfdfdfff] text-black p-4">
          <label className="block mb-2 font-semibold">
            Edit Promotional Template HTML {hasUnsavedChanges && <span className="text-orange-600">(Unsaved Changes)</span>}
          </label>
          <textarea
            className="w-full h-96 p-3 border rounded font-mono text-sm"
            value={html}
            onChange={e => setHtml(e.target.value)}
            placeholder="HTML template content..."
          />
        </div>

        <div className="mb-6 rounded-xl bg-[#dfdfdfff] text-black p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-medium">Live Preview</h2>
            <button
              onClick={() => setPreviewExpanded(!previewExpanded)}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              {previewExpanded ? 'Collapse' : 'Expand'} Preview
            </button>
          </div>
          <div className={`border p-4 rounded bg-white overflow-auto ${
            previewExpanded ? 'max-h-screen' : 'max-h-96'
          }`}>
            {html ? (
              <div dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
              <em className="text-gray-500">No template loaded. Click &quot;Load Template&quot; to load the promotional email template.</em>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-[#212121ff] text-white p-4">
          <h2 className="text-xl font-medium mb-2">Instructions</h2>
          <ul className="space-y-2 text-sm">
            <li>• Edit the HTML template in the editor above</li>
            <li>• Click &quot;Save Changes&quot; to save your edits to the file</li>
            <li>• Enter email addresses separated by commas in the text area above</li>
            <li>• Click &quot;Send Emails&quot; to send the promotional email to all addresses</li>
            <li>• Each recipient will receive the current template (saved or unsaved)</li>
            <li>• Make sure all email addresses are valid before sending</li>
          </ul>
        </div>

        <div className="rounded-xl bg-[#dfdfdfff] text-black p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-medium">Email Send Log</h2>
            <button
              onClick={() => setEmailLog([])}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Clear Log
            </button>
          </div>
          {emailLog.length === 0 ? (
            <p className="text-gray-600 text-sm">No emails sent yet.</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-auto">
              {emailLog.map((entry, index) => (
                <div key={index} className="border rounded p-3 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      entry.status === 'success'
                        ? 'bg-green-100 text-green-800'
                        : entry.status === 'partial'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {entry.status === 'success' ? '✅ Sent' : entry.status === 'partial' ? '⚠️ Partial' : '❌ Failed'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div><strong>{entry.recipientCount}</strong> recipient{entry.recipientCount !== 1 ? 's' : ''}</div>
                    {entry.campaignName && (
                      <div><strong>Campaign:</strong> {entry.campaignName}</div>
                    )}
                    {(entry.contactsAdded !== undefined || entry.contactsUpdated !== undefined) && (
                      <div>
                        <strong>Contacts:</strong> +{entry.contactsAdded || 0} new, ↑{entry.contactsUpdated || 0} updated
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    To: {entry.recipients.slice(0, 3).join(', ')}
                    {entry.recipients.length > 3 && ` +${entry.recipients.length - 3} more`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}