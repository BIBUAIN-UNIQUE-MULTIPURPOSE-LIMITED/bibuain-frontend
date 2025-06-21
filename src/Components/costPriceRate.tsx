import React from 'react'
import CustomSelect from './DropDownSelect'


// interface Usern {
//     id:number,
//  platform:string,
// cost:number,
// market:number,
// coin:number,
// }

// interface UserTableProps {
//   usersn: Usern[]; 
// }




const CostPrice = ({ usersn }) => {

       const handleSelection = (value: string) => {
    console.log('Selected:', value);
  };



  return (
    <div className='myOffers last'>
    
  
    <div className="form-top">
      <div>
        <p>Cost Price Analysis</p>
        </div>
      <div>
            
            <div className='flex'>
             <CustomSelect
                    label="All"
                    options={['Active', 'Inactive']}
                    onSelect={handleSelection}
                  />    &nbsp;&nbsp;
             <CustomSelect
                    label="Currency"
                    options={['EUR', 'GBP', 'NGN']}
                    onSelect={handleSelection}
                  />   </div>       
      </div>
    </div>


     <div className="overflow-x-auto"  style={{borderRadius:"10px"}}>
      <table  style={{borderRadius:"10px"}} className="min-w-full border b-10">
        <thead>
          <tr className="bg-gray-50">
            <th className="py-2 px-4 border-b">Platform</th>
            <th className="py-2 px-4 border-b">Cost Price (&#8358;)</th>
            <th className="py-2 px-4 border-b">Market Price</th>
            <th className="py-2 px-4 border-b">Coin Purchased</th>
          </tr>
        </thead>
        <tbody>
          {usersn.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              
             
              <td className="py-2 px-4 border-b text-center">{user.platform}</td>
              <td className="py-2 px-4 border-b text-center">{"₦"+user.cost}</td>
              <td className="py-2 px-4 border-b text-center">{"₦"+user.market}</td>
              <td className="py-2 px-4 border-b text-center">{+user.coin}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>



{/* 
  <div className="btt">
      <button className="deactivate" onClick={onDeactivate}>
        Deactivate All Offers
      </button>
      <button onClick={onActivate}>
        Activate All Offers
      </button>
    </div> */}




    
    </div>
  )
}

export default CostPrice