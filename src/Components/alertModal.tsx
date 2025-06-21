'use client';



interface UserTableProps {
  title: string;
  mini: string;
  onClose: () => void;
  onConfirm: () => void;
}

const AlertModal: React.FC<UserTableProps> = ({ title, mini, onClose, onConfirm }) => {



  

  return (
    <>
      {/* Your modal content goes here */}
      <div className='modall'>
        <div className="content border shadow">
        <div className="heaaa">
          <h2>{title}</h2>
          <button onClick={onClose}><i  className='fa fa-close'></i></button>
          </div>

        <p>{mini}</p>

<div className='flex justify-end'>
        <button onClick={onClose} className='btnrr p-2 w-100 ml-4'> Cancel</button>
        <button onClick={onConfirm} className='btnrr active p-2 w-100 ml-4'> Confirm</button>

</div>


        </div>
      </div>
    </>
  );
};

export default AlertModal;
