import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Get the Webhook secret from environment
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('CLERK_WEBHOOK_SECRET is not set');
  }

  // Get the headers (await for Next.js 15+)
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the webhook signature
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  console.log(`Clerk Webhook received: ${eventType}`);

  switch (eventType) {
    case 'user.created':
      console.log('User created:', evt.data.id);
      // TODO: Create user in your database
      // await createUserInDatabase(evt.data);
      break;

    case 'user.updated':
      console.log('User updated:', evt.data.id);
      // TODO: Update user in your database
      // await updateUserInDatabase(evt.data);
      break;

    case 'user.deleted':
      console.log('User deleted:', evt.data.id);
      // TODO: Delete or mark user as deleted in your database
      // await deleteUserInDatabase(evt.data.id);
      break;

    case 'organization.created':
      console.log('Organization created:', evt.data.id);
      // TODO: Create organization in your database
      // await createOrganizationInDatabase(evt.data);
      break;

    case 'organization.updated':
      console.log('Organization updated:', evt.data.id);
      // TODO: Update organization in your database
      // await updateOrganizationInDatabase(evt.data);
      break;

    case 'organization.deleted':
      console.log('Organization deleted:', evt.data.id);
      // TODO: Delete organization in your database
      // await deleteOrganizationInDatabase(evt.data.id);
      break;

    case 'organizationMembership.created':
      console.log('Organization membership created:', evt.data.id);
      // TODO: Handle new organization member
      // await addOrganizationMember(evt.data);
      break;

    case 'organizationMembership.deleted':
      console.log('Organization membership deleted:', evt.data.id);
      // TODO: Handle organization member removal
      // await removeOrganizationMember(evt.data);
      break;

    case 'organizationMembership.updated':
      console.log('Organization membership updated:', evt.data.id);
      // TODO: Handle organization member role/permission changes
      // await updateOrganizationMember(evt.data);
      break;

    case 'session.created':
      console.log('Session created for user:', evt.data.user_id);
      // TODO: Track user session analytics
      break;

    case 'session.ended':
      console.log('Session ended for user:', evt.data.user_id);
      // TODO: Track session analytics
      break;

    default:
      console.log('Unhandled webhook event:', eventType);
  }

  return NextResponse.json({ received: true });
}
