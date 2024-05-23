import { GridColDef } from "@mui/x-data-grid";
import "./add.scss";

type Props = {
  slug: string;
  columns: GridColDef[];
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

// import firebase from 'firebase/app';
// import 'firebase/database';

// Initialize Firebase
// TODO: Replace with your project's customized code snippet
// var config = {
//   apiKey: "<API_KEY>",
//   authDomain: "<PROJECT_ID>.firebaseapp.com",
//   databaseURL: "https://<DATABASE_NAME>.firebaseio.com",
//   storageBucket: "<BUCKET>.appspot.com",
//   messagingSenderId: "<SENDER_ID>",
// };
// firebase.initializeApp(config);

const Add = (props: Props) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    //add new item
    // firebase.database().ref(`${props.slug}s/111`).set({
    //   img: "",
    //   lastName: "Hello",
    //   firstName: "Test",
    //   email: "testme@gmail.com",
    //   phone: "123 456 789",
    //   createdAt: "01.02.2023",
    //   verified: true,
    // });

    props.setOpen(false)
  };



  return (
    <div className="add">
      <div className="modal">
        <span className="close" onClick={() => props.setOpen(false)}>
          X
        </span>
        <h1>Add new {props.slug}</h1>
        <form onSubmit={handleSubmit}>
          {props.columns
            .filter((item) => item.field !== "id" && item.field !== "img" && item.field !== "action" && item.field !== "Vérifiée")
            .map((column) => (
              <div className="item">
                <label>{column.headerName}</label>
                <input type={column.field === 'Pièce Identité' || column.field === 'Avis D\'impôts' ? 'file' : column.type} placeholder={column.field} />
              </div>
            ))}
          <button>Si vous êtes sûre de vouloir créer un Nouveau</button>
        </form>
      </div>
    </div>
  );
};

export default Add;