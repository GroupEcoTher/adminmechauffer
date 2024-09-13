import React, { useEffect, useState } from 'react';
import { getAdminUsers } from '../config/firebase';
import { User } from './types/types';

interface AdminUserListProps {
  onSelectUser: (user: User) => void;
}

const AdminUserList: React.FC<AdminUserListProps> = ({ onSelectUser }) => {
  const [adminUsers, setAdminUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchAdminUsers = async () => {
      const users = await getAdminUsers();
      setAdminUsers(users);
    };

    fetchAdminUsers();
  }, []);

  return (
    <div>
      <h2>Liste des utilisateurs administrateurs</h2>
      <ul>
        {adminUsers.map((user) => (
          <li key={user.uid} onClick={() => onSelectUser(user)}>
            {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminUserList;