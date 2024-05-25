// src/components/single/UserDetails.tsx


import React from 'react';
import formatFirebaseTimestamp from '../../components/single/Single';


function UserDetails({ user, closeModal }) {
  return (
    <div>
      <h2>User Details</h2>
      <p>ID: {user.id}</p>
      <p>First Name: {user.firstName}</p>
      <p>Last Name: {user.lastName}</p>
      <p>Email: {user.email}</p>
      <p>Phone: {user.phone}</p>
      <p>Created At: {formatFirebaseTimestamp(user.dateCreation)}</p>
      <button onClick={closeModal}>Close</button>
    </div>
  );
}

export default UserDetails;