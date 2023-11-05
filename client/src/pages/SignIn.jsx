import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signInStart, signInSuccess, signInFailure } from "../redux/user/userSlice";
import OAuth from "../components/OAuth";


const SignIn = () => {
  const [formData, setFormData] = useState({});
  const [dupError, setDupError] = useState(null);
  const{loading, error} = useSelector((state)=>state.user)
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(signInStart());
    const res = await fetch("/api/auth/signin", {
      method: "Post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const data = await res.json();

    if (data.success === false) {
      dispatch(signInFailure(data.message))
      setDupError(
        data.message.startsWith("Incorrect") ||
          data.message.startsWith("User Not found")
      );

      return;
    } else {
      setDupError();
      dispatch(signInSuccess(data))
      navigate("/");
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7 uppercase">
        Sign In
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          required
          placeholder="Username or Email"
          className="border p-3 rounded-lg"
          id="username"
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
        <button
          disabled={loading}
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-90 disabled:opacity-80"
        >
          {loading ? "Signing in" : "Sign in"}
        </button>
        <OAuth/>
      </form>
      <div className="flex gap-2 mt-5">
        <p>
          <span>Do not have an account? </span>
          <Link to={"/sign-up"}>
            <span className="text-blue-600">Sing up</span>
          </Link>
        </p>
      </div>
      <div
        className={`${
          dupError &&
          " my-5 border border-red-500 py-4 rounded-lg shadow-2xl bg-white flex gap-44"
        }`}
        id="dupid"
      >
        <p className="text-red-700  mx-3">{dupError && error}</p>
      </div>
    </div>
  );
};

export default SignIn;
