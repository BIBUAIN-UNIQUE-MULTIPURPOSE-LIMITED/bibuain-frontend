
import React from 'react'
import CustomSelect from './DropDownSelect'




const MyOffers = ({ users, onActivate, onDeactivate }) => {

       const handleSelection = (value: string) => {
    console.log('Selected:', value);
  };



  return (
    <div className='myOffers border'>
    
  
    <div className="form-top">
      <div>
        <p>My Offers</p>
        </div>
      <div>
            
            <div className='flex'>
             <CustomSelect
                    label="All"
                    options={['Active', 'Inactive']}
                    onSelect={handleSelection}
                  />    &nbsp;&nbsp;
             <CustomSelect
                    label="Coin"
                    options={['EUR', 'GBP', 'NGN']}
                    onSelect={handleSelection}
                  />   </div>       
      </div>
    </div>


     <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="py-2 px-4 border-b">Platform</th>
            <th className="py-2 px-4 border-b">Coin</th>
            <th className="py-2 px-4 border-b">Type</th>
            <th className="py-2 px-4 border-b">Payment Method</th>
            <th className="py-2 px-4 border-b">Offer Rate</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td
                className={`py-2 px-4 border-b text-center coinss ${
                    user.platform === 'Binance' ? 'binanceBG' : 'CoinBG'
                }`}
                >
                <p>{user.platform}</p>
              </td>
              <td className="py-2 px-4 border-b text-center">{user.coin}</td>
              <td
                className={`py-2 px-4 border-b text-center ${
                    user.type === 'Sell' ? 'text-red-500' : 'text-green-500'
                }`}
                >
                {user.type}
              </td>
              <td className="py-2 px-4 border-b text-center">{user.paymentmethod}</td>
              <td className="py-2 px-4 border-b text-center">{"₦"+user.offer}</td>
              <td className="py-2 px-4 border-b text-center"><button className='actionn'>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>




  <div className="btt">
      <button className="deactivate" onClick={onDeactivate}>
        Deactivate All Offers
      </button>
      <button onClick={onActivate}>
        Activate All Offers
      </button>
    </div>




    
    </div>
  )
}

export default MyOffers