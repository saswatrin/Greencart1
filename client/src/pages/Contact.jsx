import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({
      name,
      email,
      message,
    });

    toast.success(
      "Thank you for reaching out! Our team will get back to you shortly.",
      {
        style: {
          border: "1px solid #A3E635",
          padding: "16px",
          color: "#14532D",
        },
        iconTheme: {
          primary: "#22C55E",
          secondary: "#F0FDF4",
        },
      }
    );

    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <form
        className="flex flex-col items-center text-sm"
        onSubmit={handleSubmit}
      >
        <p className="text-lg text-primary font-medium pb-2 mt-16">
          Contact GreenCart
        </p>
        <h1 className="text-4xl font-semibold text-slate-700 pb-4">
          We’d love to hear from you
        </h1>
        <p className="text-sm text-gray-500 text-center pb-10">
          Whether you have questions about our products, need assistance, or
          just want to share your feedback, we’re here to help. <br />
          Reach out to us and our team will get back to you as soon as possible.
        </p>

        <div className="flex flex-col md:flex-row items-center gap-8 w-[350px] md:w-[700px]">
          <div className="w-full">
            <label className="text-black/70" htmlFor="name">
              Full Name
            </label>
            <input
              className="h-12 p-2 mt-2 w-full border border-gray-500/30 rounded outline-none focus:border-primary"
              type="text"
              name="name"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="w-full">
            <label className="text-black/70" htmlFor="email">
              Email Address
            </label>
            <input
              className="h-12 p-2 mt-2 w-full border border-gray-500/30 rounded outline-none focus:border-primary"
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="mt-6 w-[350px] md:w-[700px]">
          <label className="text-black/70" htmlFor="message">
            Your Message
          </label>
          <textarea
            className="w-full mt-2 p-2 h-40 border border-gray-500/30 rounded resize-none outline-none focus:border-primary"
            name="message"
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          ></textarea>
        </div>

        <button
          type="submit"
          className="mt-5 bg-primary text-white h-12 w-56 px-4 rounded active:scale-95 transition hover:bg-primary-dull"
        >
          Send Message
        </button>
      </form>
    </>
  );
}

export default Contact;
