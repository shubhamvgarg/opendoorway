import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OAuth from "../components/OAuth";

const SignUp = () => {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null)
  const [dupError, setDupError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const navigate = useNavigate()
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    const res = await fetch("/api/auth/signup", {
      method: "Post",
      headers: {
        "Content-Type": "application/json",
      },
      body:JSON.stringify(formData),
    });
    const data = await res.json();
    
    if(data.success===false){
      setError(data.message)
      setLoading(false)
      setDupError(data.message.startsWith("E11000 duplicate key error collection"));
     
      return;
    }else{
      setDupError()
      setLoading(false)
      navigate('/sign-in')
    }

  };

  

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7 uppercase">
        Sign up
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          required
          placeholder="Name"
          className="border p-3 rounded-lg"
          id="name"
          onChange={handleChange}
        />
        <input
          type="text"
          required
          placeholder="Username"
          className="border p-3 rounded-lg"
          id="username"
          onChange={handleChange}
        />
        <input
          type="email"
          required
          placeholder="Email"
          className="border p-3 rounded-lg"
          id="email"
          onChange={handleChange}
        />
        <input
          type="password"
          required
          placeholder="Password"
          className="border p-3 rounded-lg"
          id="password"
          onChange={handleChange}
        />
        <button disabled={loading} className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-90 disabled:opacity-80">
         {loading ? "Signing up":'Sign up'}
        </button>
        <OAuth/>
      </form>
      <div className="flex gap-2 mt-5">
        <p>
          <span>Have an account? </span>
          <Link to={"/sign-in"}>
            <span className="text-blue-600">Sing in</span>
          </Link>
        </p>
      </div>
      <div   className={`${dupError  && " my-5 border border-red-500 py-4 rounded-lg shadow-2xl bg-white flex gap-44" }` } id='dupid'>
        <p className="text-red-700  mx-3">{ dupError && "Username or Email id already exist"}</p>
        {/* <button className="text-black hover:cursor-pointer" onClick={handleNotification}>{ dupError && "X"}</button> */}
      </div>
    </div>
  );
};

export default SignUp;