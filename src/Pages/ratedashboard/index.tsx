import {useState, useEffect} from 'react'
import "../../App.css";
import CollapsedNav from '../../Components/collapsedNav';
import BlockGrid from '../../Components/coinBalances'
import NewPlatform from '../../Components/addPlatform';
import PaltformModal from '../../Components/PlatformModal'
import MyOffers from '../../Components/myOffers';
import AlertModal from '../../Components/alertModal';
import { ButtomNotification } from '../../Components/ButtomNotification';
import CostPrice from '../../Components/costPriceRate';



const Ratedashboard = () => {




      const [showNotification, setShowNotification] = useState(false);
    
    //  useEffect(() => {
    //     setShowNotification(true);
    
    //     const timer = setTimeout(() => {
    //       setShowNotification(false);
    //     }, 5000);
    
    //     return () => clearTimeout(timer);
    //   }, []);
    
    //   }




      const users = [
  {id:1, platform: "Binance", coin: 'BTC', type: 'Buy', paymentmethod: 'Bank transfer', offer: '64,348,584.50' },
  {id:2, platform: "Paxful", coin: 'BTC', type: 'Sell', paymentmethod: 'Bank transfer', offer: '64,127,000.00' },
];

  const usersn = [
  {id:1, platform: "Main Account", cost: '64,324,092.50', market: '64,324,092.50', coin: '1.0002'},
  {id:2, platform: "Trading Account", cost: '64,172,000.00', market: '64,172,000.00', coin: '0.9876'},
  {id:3, platform: "Reserved Account", cost: '64,257,291.50', market: '64,257,291.50', coin: '0.9989'},
  
];


    const handleActivate = () => {
  setShowPopup(true);
  
};


//     const handleActivatea = () => {
//   setShowPopupb(true);
  
// };

 const handleDeactivateb = () => {
   setShowPopupb(true);
  };



      const handleActivatea = () => {
  setShowPopupa(true);
  
};

 const handleDeactivatea = () => {
   setShowPopupb(true);
  };



    const [active, setIsActive] = useState(2)


    const [showPopup, setShowPopup] = useState(false)
    const [showPopupb, setShowPopupb] = useState(false)
    const [showPopupa, setShowPopupa] = useState(false)


  return (
    <div className='dashboard-content'>
        {/* top btns*/}
        <div className="btns">
            <button 
            className={active === 1 ? 'active' : ''} 
            onClick={() => setIsActive(1)}
            >
            Rate Settings
            </button>
            <button 
            className={active === 2 ? 'active' : ''} 
            onClick={() => setIsActive(2)}
            >
            Overpayment Monitoring
            </button>
        </div>



           <h1 className='heaa'>Management Dashboard</h1>
                   
            <div>
                <CollapsedNav
                items={[
                    { name: 'Bitcoin', title: 'BTC' },
                    { name: 'Tether', title: 'USDT' },
                    { name: 'Ehereum', title: 'ETH' },
                ]}
                />
            </div>


{/* Coin Balance Cards */}
    
    <BlockGrid
    active = {true}
    name= "Binance"
    market = "sell"
    balance ="$64,245.65"
    costPrice={"64,324,092.50"}
    control= {false}
    />

    <BlockGrid
    active = {true}
    name= "Paxful"
    market = "buy"
    balance ="$64,198.32"
    costPrice={"64,243,188.80"}
    control= {true}
    />

    <BlockGrid
    active = {true}
    name= "Paxful"
    market = "buy"
    balance ="$64,301.78"
    costPrice={"64,426,894.40"}
    control= {true}
    />


{/* Add Platform */}

<NewPlatform 
setOpen={()=> setShowPopup(true)} />




{/* Platform Modal */}


{showPopup && (
  <PaltformModal
  onConfirm={() => {
setShowPopup(false)

    // setTimeout(() => setShowNotification(false), 5000);
  }
  }

  title="Apply to Platform"
  mini="Select which platform you want to apply the current settings"
  
  onClose={() => {
    setShowPopup(false)

    

    }
} />
)}







{/* My Offer */}

 <MyOffers 
     onActivate={handleActivatea} 
     onDeactivate={handleDeactivatea} 
     users={users}  
     />




{/* COST PRICE */}
<CostPrice
usersn={usersn}
/>


{/* Activate Offers Alert */}

{showPopupa && (
  <AlertModal
  onConfirm={() => {
setShowPopupa(false)
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  }
  }

  title="Activate All Offers"
  mini="Are u sure you want to activate all offers?"
  
  onClose={() => {
    setShowPopupa(false)

    

    }
  } />
)}


{/* Deactivate Offer Modal */}

{showPopupb && (
  <AlertModal
  onConfirm={() => {
setShowPopupb(false)
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  
  }
  }

  title="Deactivate All Offers"
  mini="Are u sure you want to Deactivate all offers?"
  
  onClose={() => {
    setShowPopupb(false)
  } } />
)}




{/* Bottom Notification */}
 {showNotification && <ButtomNotification />}



    </div>
  )
}

export default Ratedashboard