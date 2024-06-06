import { GridColDef } from "@mui/x-data-grid";
import "./add.scss";

type Props = {
  slug: string;
  columns: GridColDef[];
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};


const Add = (props: Props) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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