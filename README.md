# ctb-network

## A blockchain network for concert ticket booking

This concert ticket booking network contains the following:

Participants:
- EventHost: Host of a concert
- Member: Buyer of concert ticket

Assets:
- Ticket
- TicketListing: Contains listing of available tickets
- Event

Transactions:
- CreateEvent
- SellTicket
- ResellTicket
- UseTicket

Members are supposed to buy tickets which are sold by event hosts. They have a feature to resell tickets if they want.
Once a ticket is used, a member won't be able to re-use it for any other concert.
