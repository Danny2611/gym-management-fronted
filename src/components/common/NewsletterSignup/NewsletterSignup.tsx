import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "../Button";

const newsletterSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

interface NewsletterSignupProps {
  title?: string;
  subtitle?: string;
}

const NewsletterSignup: React.FC<NewsletterSignupProps> = ({
  title = "Subscribe to Our Newsletter",
  subtitle,
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
  });

  // const onSubmit = async (data: NewsletterFormData) => {
  //   setLoading(true);
  //   setMessage(null);

  //   // Giả lập API call
  //   setTimeout(() => {
  //     setLoading(false);
  //     setMessage("Thank you for subscribing!");
  //     reset();
  //   }, 1500);
  // };
  const onSubmit = async () => {
    setLoading(true);
    setMessage(null);

    // Giả lập API call
    setTimeout(() => {
      setLoading(false);
      setMessage("Thank you for subscribing!");
      reset();
    }, 1500);
  };

  return (
    <div className="mx-auto mt-12 max-w-lg rounded-lg bg-gray-900 p-6 text-center text-white shadow-md">
      <h3 className="text-2xl font-semibold">{title}</h3>
      {subtitle && <p className="mt-2 text-gray-400">{subtitle}</p>}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-4 flex flex-col gap-3 md:flex-row"
      >
        <input
          type="email"
          placeholder="Enter your email"
          className={`focus:ring-primary-500 w-full rounded-md border bg-transparent px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
            errors.email ? "border-red-500" : "border-gray-500"
          }`}
          {...register("email")}
        />
        <Button
          type="submit"
          text={loading ? "Subscribing..." : "Subscribe"}
          disabled={loading}
          variant="primary"
          size="medium"
        />
      </form>
      {errors.email && (
        <p className="mt-2 text-sm text-red-500">{errors.email.message}</p>
      )}
      {message && <p className="mt-3 text-green-400">{message}</p>}
    </div>
  );
};

export default NewsletterSignup;
