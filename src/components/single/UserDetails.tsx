import { formatFirebaseTimestamp } from '../../utils';

interface UserDetailsProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateCreation: {
      seconds: number;
      nanoseconds: number;
    };
  };
  closeModal: () => void;
}

const UserDetails: React.FC<UserDetailsProps> = ({ user, closeModal }) => {
  if (!user) {
    return <div>Loading...</div>;
  }

  const formattedDate = formatFirebaseTimestamp(user.dateCreation);
  
  return (
    <div>
      <h2>User Details</h2>
      <p>ID: {user.id}</p>
      <p>First Name: {user.firstName}</p>
      <p>Last Name: {user.lastName}</p>
      <p>Email: {user.email}</p>
      <p>Phone: {user.phone}</p>
      <p>Created At: {formattedDate ? formattedDate.toLocaleString() : 'N/A'}</p>
      <button onClick={closeModal}>Close</button>
    </div>
  );
}

export default UserDetails;
