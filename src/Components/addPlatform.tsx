import {useState, useEffect} from 'react'
import CustomSelect from './DropDownSelect'



const NewPlatform = ({setOpen}) => {

       const handleSelection = (value: string) => {
    console.log('Selected:', value);
  };





    const [isActive, setIsActive] = useState(false);
    
    useEffect(() => {
      setIsActive(true);
    }, [false]);
  
    const handleToggle = () => {
      setIsActive(prev => !prev);
    };







    const [isActiveb, setIsActiveb] = useState(true);
    
    useEffect(() => {
      setIsActiveb(false);
    }, [false]);
  
    const handleToggleb = () => {
      setIsActiveb(prev => !prev);
    };



      const [isActivec, setIsActivec] = useState(true);
    
    useEffect(() => {
      setIsActivec(true);
    }, [false]);
  
    const handleTogglec = () => {
      setIsActivec(prev => !prev);
    };



    
      const [isActived, setIsActived] = useState(true);
    
    useEffect(() => {
      setIsActived(false);
    }, [false]);
  
    const handleToggled = () => {
      setIsActived(prev => !prev);
    };


  return (
    <>
     {/* <div className='addPlatform'>
          <p><i className='fa fa-add'></i> Add Platform</p>
      </div> */}
  
    <div className="form-top">
      <div>
        <p>All Platforms</p>
        </div>
      <div>
             <CustomSelect
                    label="Currency"
                    options={['EUR', 'GBP', 'NGN']}
                    onSelect={handleSelection}
                  />          
      </div>
    </div>

    <div className='pricing'>
      <div className='child'>
        <p>USD Price</p>
        <p className='font-bold'>$6425.85</p>
      </div>

       <div className='child'>
        <p>NGN Price</p>
        <p className='font-bold'>&#8358;4867634.85</p>
      </div>
    </div>



    <div className='pricing b'>
 
 <div className='child'>
        <p className='font-bold'>Market Price</p>

      
        <p className='text-slate-500' style={{marginBottom:"5px"}}>Percentage (%) 

             <div className="btn" style={{display:"inline-block", marginLeft:"10px"}}>
      <button className={isActive ? 'act' : 'inact'}>
        <p style={{borderRadius:"10px", fontSize:"10px", width:"50px",}}
          className={`transition-all duration-500 ease-in-out ${
            isActive ? 'text-green-600 bg-green-200 p-0.5 opacity-100' : 'p-0.5 text-red-600 bg-red-200 opacity-60'
          }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </p>
      </button>
    </div>
 
          
      <div className="a aa" style={{float:"right", marginRight:"15px"}}>
      <label className="switch">
        <input
          type="checkbox"
          id="rateToggle"
          checked={isActive}
          onChange={handleToggle}
        />
        <span className="slider"></span>
      </label>
    </div>
    
    </p>
        <input placeholder='Enter Mockup Percentage' className='shadow p-2' type='text' />
      </div>

 <div className='child'>
        <p className='font-bold text-transparent'>.</p>

      
        <p className='text-slate-500' style={{marginBottom:"5px"}}>Value (&#8358;) 

             <div className="btn" style={{display:"inline-block", marginLeft:"10px"}}>
      <button className={isActive ? 'act' : 'inact'}>
        <p style={{borderRadius:"10px", fontSize:"10px", width:"50px",}}
          className={`transition-all duration-500 ease-in-out ${
            isActiveb ? 'text-green-600 bg-green-200 p-0.5 opacity-100' : 'p-0.5 text-red-600 bg-red-200 opacity-60'
          }`}
        >
          {isActiveb ? 'Active' : 'Inactive'}
        </p>
      </button>
    </div>
 
          
      <div className="a aa" style={{float:"right", marginRight:"15px"}}>
      <label className="switch">
        <input
          type="checkbox"
          id="rateToggle"
          checked={isActiveb}
          onChange={handleToggleb}
        />
        <span className="slider"></span>
      </label>
    </div>
    
    </p>
        <input placeholder='Markup Value in &#8358;' className='shadow p-2' type='text' />
      </div>

       
    </div>



      <div className='pricing b'>
 
 <div className='child'>
        <p className='font-bold'>Rate</p>

      
         
        <p className='text-slate-500' style={{marginBottom:"5px"}}>Buy Rate 

             <div className="btn" style={{display:"inline-block", marginLeft:"10px"}}>
      <button className={isActive ? 'act' : 'inact'}>
        <p style={{borderRadius:"10px", fontSize:"10px", width:"50px",}}
          className={`transition-all duration-500 ease-in-out ${
            isActivec ? 'text-green-600 bg-green-200 p-0.5 opacity-100' : 'p-0.5 text-red-600 bg-red-200 opacity-60'
          }`}
        >
          {isActivec ? 'Active' : 'Inactive'}
        </p>
      </button>
    </div>
 
          
      <div className="a aa" style={{float:"right", marginRight:"15px"}}>
      <label className="switch">
        <input
          type="checkbox"
          id="rateToggle"
          checked={isActivec}
          onChange={handleTogglec}
        />
        <span className="slider"></span>
      </label>
    </div>

    </p>
        <input placeholder='Sell Cost Price in $' className='shadow p-2' type='text' />
      </div>

 <div className='child'>
        <p className='font-bold text-transparent'>.</p>

      

      
         
        <p className='text-slate-500' style={{marginBottom:"5px"}}>Buy Rate 

             <div className="btn" style={{display:"inline-block", marginLeft:"10px"}}>
      <button className={isActive ? 'act' : 'inact'}>
        <p style={{borderRadius:"10px", fontSize:"10px", width:"50px",}}
          className={`transition-all duration-500 ease-in-out ${
            isActived ? 'text-green-600 bg-green-200 p-0.5 opacity-100' : 'p-0.5 text-red-600 bg-red-200 opacity-60'
          }`}
        >
          {isActived ? 'Active' : 'Inactive'}
        </p>
      </button>
    </div>
 
          
      <div className="a aa" style={{float:"right", marginRight:"15px"}}>
      <label className="switch">
        <input
          type="checkbox"
          id="rateToggle"
          checked={isActived}
          onChange={handleToggled}
        />
        <span className="slider"></span>
      </label>
    </div>

    </p>
        <input placeholder='Sell Cost Price in &#8358;' className='shadow p-2' type='text' />
      </div>

       
    </div>



<div className="btt">
  <button onClick={setOpen}>Apply To All Platforms</button>
</div>




    
    </>
  )
}

export default NewPlatform