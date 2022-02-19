/**
 * This function is used by the participants to add new events to the business network archive
 * @param {org.ctb.network.CreateEvent} CreateEvent - the CreateEvent is to be processed
 * @transaction
 */

async function createEventTransaction(txCreateEvent) {
  let factory = getFactory()
  let nSpace = 'org.ctb.network'

  let newEvent = factory.newResource(nSpace, 'TicketedEvent', txCreateEvent.eventId)
  newEvent.date = txCreateEvent.date
  if (txCreateEvent.description)
    newEvent.description = txCreateEvent.description
  newEvent.venue = txCreateEvent.venue
  newEvent.eventType = txCreateEvent.eventType
  newEvent.ticketQuantity = txCreateEvent.ticketQuantity
  newEvent.marketPrice = txCreateEvent.faceValue
  newEvent.eventHost = txCreateEvent.host

  const tickets = []
  for (let i = 0; i < txCreateEvent.ticketQuantity; i++) {
    let ticket = factory.newResource(nSpace, 'Ticket', `TICKET${i + 1}`)
    ticket.seatId = `SEAT${i + 1}`
    ticket.ticketState = 'UNSOLD'
    ticket.faceValue = txCreateEvent.faceValue
    ticket.event = factory.newRelationship(nSpace, 'TicketedEvent', newEvent.eventId)
    ticket.owner = txCreateEvent.host
    ticket.lastOwner = txCreateEvent.host
    tickets.push(ticket)
  }

  let eventAssetRegistry = getAssetRegistry(`${nSpace}.TicketedEvent`)
  await eventAssetRegistry.add(newEvent)
  let ticketAssetRegistry = getAssetRegistry(`${nSpace}.Ticket`)
  await ticketAssetRegistry.addAll(tickets)

  return txCreateEvent.eventId
}


/**
 * This function is used by the participants to sell ticket in the network
 * @param {org.ctb.network.SellTicket} SellTicket - the SellTicket is to be processed
 * @transaction
 */

async function sellTicketTransaction(txSellTkt) {
  if (txSellTkt.ticket.ticketState == 'UNSOLD') {
    let ticket = txSellTkt.ticket
    ticket.salePrice = ticket.faceValue
    ticket.ticketState = 'SALE'
    ticket.owner = txSellTkt.buyer

    let ticketAssetRegistry = getAssetRegistry('org.ctb.network.Ticket')
    await ticketAssetRegistry.update(ticket)

    return ticket.ticketId
  } else {
    throw new Error('Error: Ticket already sold')
  }
}


/**
 * This function is used by the participants to resell tickets in the network
 * @param {org.ctb.network.ResellTicket} ResellTicket - the ResellTicket is to be processed
 * @transaction
 */

async function resellTicketTransaction(txResellTkt) {
  let nSpace = 'org.ctb.network'

  if (txResellTkt.listing.ticket.ticketState == 'RESELL' || txResellTkt.listing.ticket.ticketState == 'UNSOLD' || txResellTkt.listing.ticket.ticketState == 'USED') {
    throw new Error('Error: Ticket either already resold or unsold or used')
  } else {
    let listing = txResellTkt.listing
    listing.ticket.salePrice = listing.listingPrice
    listing.ticket.ticketState = 'RESELL'
    listing.ticket.lastOwner = listing.ticket.owner
    listing.ticket.owner = txResellTkt.buyer
    listing.state = 'SALE'

    const ticketAssetRegistry = getAssetRegistry(`${nSpace}.Ticket`)
    await ticketAssetRegistry.update(listing.ticket)

    const ticketListingRegistry = getAssetRegistry(`${nSpace}.TicketListing`)
    await ticketListingRegistry.update(listing)

    return ticket.ticketId
  }
}


/**
 * This function is used by the participants to use tickets in the network
 * @param {org.ctb.network.UseTicket} UseTicket - the UseTicket is to be processed
 * @transaction
 */

async function useTicketTransaction(txUseTkt) {
  if (txUseTkt.ticket.ticketState == 'UNSOLD') {
    throw new Error('Error: Ticket is unsold and cannot be used')
  } else {
    const ticket = txUseTkt.ticket
    ticket.ticketState = 'USED'

    const ticketAssetRegistry = getAssetRegistry('org.ctb.network.Ticket')
    await ticketAssetRegistry.update(ticket)

    return ticket.ticketId
  }
}
