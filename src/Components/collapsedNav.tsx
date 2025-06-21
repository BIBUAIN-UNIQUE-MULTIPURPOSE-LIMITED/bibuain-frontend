import { useState } from 'react';
import CustomSelect from './DropDownSelect'






interface CollapsedNavProps {
  items: {
    name: string;
    title: string;
  }[];
}

const CollapsedNav = ({ items }: CollapsedNavProps) => {

   const handleSelection = (value: string) => {
    console.log('Selected:', value);
  };


  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  return (
  <div className='coll'>
    <div className="slide shadow p-1 m-4">
      {items.map((item, index) => (
        <div
          key={index}
          className={`list cursor-pointer px-4 py-2 rounded ${
            activeIndex === index ? 'bg-blue-500 text-white active' : 'bg-white text-black'
          }`}
          onClick={() => setActiveIndex(index)}
        >
          {item.name} ({item.title})
        </div>
      ))}

      <i className='fa fa-add p-2' ></i>
    </div>

    <div className='right'>
        <CustomSelect
        label="Currency"
        options={['EUR', 'GBP', 'NGN']}
        onSelect={handleSelection}
      />

       <button onClick={()=>window.location.href="#"} className='bg-white border border-gray-300 rounded-lg px-4 py-2 flex justify-between items-center cursor-pointer ml-5'>
        <i className='fa fa-refresh mr-2'></i> Refresh
        </button>
       
    </div>
  </div>
  );
};

export default CollapsedNav;
