import React, { useState } from "react";
import { AuthFormLayout, Button, Input, Spinner } from "../components";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import axios from "../axios";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { login } from "../store/auth.reducer";

function Login() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleUserLogin = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post("/user/login", { ...data });
      if (response?.data?.success) {
        dispatch(login(response?.data?.data));
        navigate("/");
      }
    } catch (error) {
      if (error?.message?.includes("timeout of")) {
        toast.error("Request timed out. Please try again.");
      }
      toast.error(error?.response?.data?.message || error?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormLayout>
      {/* Form section */}
      <p className="text-sm font-semibold">Welcome Back!</p>
      <h1 className="text-3xl font-bold pt-4 pb-8">Sign in</h1>
      <form
        onSubmit={handleSubmit(handleUserLogin)}
        className="flex flex-col justify-center gap-2"
      >
        <Input
          inputId={"email"}
          type={"email"}
          placeholderInfo={"Email"}
          isRequired={true}
          {...register("email", { required: true })}
        />
        <Input
          inputId={"password"}
          type="password"
          placeholderInfo={"Password"}
          isRequired={true}
          {...register("password", { required: true })}
        />
        <Button className="mt-4 flex items-center justify-center">{loading ? <Spinner width="size-6" color={'stroke-white'}/> : 'Sign In'}</Button>
      </form>

      <div className="relative my-8">
        <hr className="border-accent border-2" />
        <span className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-secondary px-4 rounded-full">
          or
        </span>
      </div>

      <p className="text-xs sm:text-sm text-center">
        Don't have an account?{" "}
        <Link
          to={"/signup"}
          className="text-accent hover:text-accent/80 underline outline-none rounded-sm p-0.5 focus-visible:ring-2 ring-accent"
        >
          Create Account
        </Link>
      </p>
    </AuthFormLayout>
  );
}

export default Login;
