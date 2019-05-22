import React from "react";
import { Table, Icon, Header } from "semantic-ui-react";
import firebase from "firebase/app";
import EditGuestModal from "./EditGuestModal";
import AddGuestModal from "./AddGuestModal";

const renderDate = date =>
  `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

function renderRsvpInfo(guest) {
  if (guest.isAttending) {
    return (
      <Table.Cell positive>
        <Icon name="checkmark" />
        Yes
      </Table.Cell>
    );
  } else if (!guest.lastUpdated) {
    return (
      <Table.Cell warning>
        <Icon name="attention" />
        Not Responded
      </Table.Cell>
    );
  } else {
    return (
      <Table.Cell error>
        <Icon name="x" />
        No
      </Table.Cell>
    );
  }
}

export default function GuestList() {
  const [guests, setGuests] = React.useState([]);
  const [selectedGuest, setSelectedGuest] = React.useState(null);
  const [isAddModalOpen, setAddModalOpen] = React.useState(false);
  const [isEditModalOpen, setEditModalOpen] = React.useState(false);

  const openAddModal = () => setAddModalOpen(true);
  const closeAddModal = () => setAddModalOpen(false);

  const openEditModal = () => setEditModalOpen(true);
  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedGuest(null);
  };

  const addGuest = newGuest => {
    setGuests(prev => [...prev, newGuest]);
  };

  const editGuest = guest => {
    setGuests(prev => {
      const guestIndex = prev.findIndex(g => g.id === guest.id);
      const newGuests = [...prev];
      newGuests[guestIndex] = guest;
      return newGuests;
    });
  };

  const deleteGuest = guest => {
    setGuests(prev => prev.filter(g => g.id !== guest.id));
  };

  React.useEffect(() => {
    const fetchGuestList = async () => {
      const querySnapshot = await firebase
        .firestore()
        .collection("guests")
        .get();

      setGuests(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchGuestList();
  }, []);

  const numAttending = guests.filter(guest => guest.isAttending).length;

  return (
    <>
      <AddGuestModal
        addGuest={addGuest}
        isOpen={isAddModalOpen}
        close={closeAddModal}
        open={openAddModal}
      />

      <EditGuestModal
        guest={selectedGuest}
        isOpen={isEditModalOpen}
        close={closeEditModal}
        editGuest={editGuest}
        deleteGuest={deleteGuest}
      />

      <Header as="h1">
        <Icon name="users" />
        <Header.Content>
          Guest List
          <Header.Subheader>{`${numAttending} / ${
            guests.length
          } RSVP'd`}</Header.Subheader>
        </Header.Content>
      </Header>
      <Table padded celled selectable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>RSVP'd?</Table.HeaderCell>
            <Table.HeaderCell>Mailing Address</Table.HeaderCell>
            <Table.HeaderCell>Contact Info</Table.HeaderCell>
            <Table.HeaderCell>Last Updated</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {guests.map(guest => (
            <Table.Row
              key={guest.id}
              onClick={() => {
                setSelectedGuest(guest);
                openEditModal();
              }}
            >
              <Table.Cell>{`${guest.firstName} ${guest.lastName}`}</Table.Cell>
              {renderRsvpInfo(guest)}
              <Table.Cell>{guest.mailingAddress}</Table.Cell>
              <Table.Cell>{guest.contactInfo}</Table.Cell>
              <Table.Cell>
                {guest.lastUpdated
                  ? renderDate(guest.lastUpdated.toDate())
                  : "N/A"}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </>
  );
}