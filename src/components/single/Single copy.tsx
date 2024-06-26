import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getUserById } from '../../config/firebase';
import "./single.scss";

// Fonction pour formater un timestamp Firebase
export const formatFirebaseTimestamp = (firebaseTimestamp: { seconds: number, nanoseconds: number }): Date | null => {
  if (firebaseTimestamp && firebaseTimestamp.seconds && firebaseTimestamp.nanoseconds) {
    return new Date(firebaseTimestamp.seconds * 1000 + firebaseTimestamp.nanoseconds / 1000000);
  }
  return null;
};

type Props = {
  userId: string;
  img?: string;
  title: string;
  info?: {
    dateCreation?: { seconds: number, nanoseconds: number } | Date;
    [key: string]: any;
  };
  chart?: {
    dataKeys: { name: string; color: string }[];
    data: object[];
  };
  activities?: { time: string; text: string }[];
};

const Single = ({ userId, img, title, info = {}, chart, activities }: Props) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserById(userId);
        setUser(userData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const formattedInfo = { ...info };
  if (formattedInfo.dateCreation && typeof formattedInfo.dateCreation !== 'string') {
    const formattedDate = formatFirebaseTimestamp(formattedInfo.dateCreation as { seconds: number, nanoseconds: number });
    if (formattedDate) {
      formattedInfo.dateCreation = formattedDate;
    }
  }

  return (
    <div className="single">
      <div className="view">
        <div className="info">
          <div className="topInfo">
            {img && <img src={img} alt="" />}
            <h1>{title}</h1>
            <button onClick={openModal}>Update</button>
          </div>
          <div className="details">
            {Object.entries(formattedInfo).map((item) => (
              <div className="item" key={item[0]}>
                <span className="itemTitle">{item[0]}</span>
                <span className="itemValue">{item[1]}</span>
              </div>
            ))}
          </div>
        </div>
        <hr />
        {chart && (
          <div className="chart">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                width={500}
                height={300}
                data={chart.data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {chart.dataKeys.map((dataKey) => (
                  <Line
                    key={dataKey.name}
                    type="monotone"
                    dataKey={dataKey.name}
                    stroke={dataKey.color}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      <div className="activities">
        <h2>Latest Activities</h2>
        {activities && (
          <ul>
            {activities.map((activity) => (
              <li key={activity.text}>
                <div>
                  <p>{activity.text}</p>
                  <time>{activity.time}</time>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="User Details Modal"
      >
        {loading && <div>Loading...</div>}
        {error && <div>Error: {error}</div>}
        {user && (
          <div>
            <h2>User Details</h2>
            <p>ID: {user.id}</p>
            <p>First Name: {user.firstName}</p>
            <p>Last Name: {user.lastName}</p>
            <p>Email: {user.email}</p>
            <p>Phone: {user.phone}</p>
            <p>Created At: {user.dateCreation && formatFirebaseTimestamp(user.dateCreation as { seconds: number, nanoseconds: number })?.toLocaleDateString()}</p>
            <button onClick={closeModal}>Close</button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Single;
