// import { useState } from "react";
// import ComponentCard from "../../common/ComponentCard";
// import Label from "../Label";
// import Input from "../input/InputField";
// import Select from "../Select";
// import { CalenderIcon, EyeCloseIcon, EyeIcon, TimeIcon } from "~/icons";
// import Flatpickr from "react-flatpickr";

// export default function DefaultInputs() {
//   const [showPassword, setShowPassword] = useState(false);
//   const options = [
//     { value: "marketing", label: "Marketing" },
//     { value: "template", label: "Template" },
//     { value: "development", label: "Development" },
//   ];
//   const handleSelectChange = (value: string) => {
//     console.log("Selected value:", value);
//   };
//   const [dateOfBirth, setDateOfBirth] = useState("");

//   const handleDateChange = (date: Date[]) => {
//     setDateOfBirth(date[0].toLocaleDateString()); // Handle selected date and format it
//   };
//   return (
//     <ComponentCard title="Default Inputs">
//       <div className="space-y-6">
//         <div>
//           <Label htmlFor="input">Input</Label>
//           <Input type="text" id="input" />
//         </div>
//         <div>
//           <Label htmlFor="inputTwo">Input with Placeholder</Label>
//           <Input type="text" id="inputTwo" placeholder="info@gmail.com" />
//         </div>
//         <div>
//           <Label>Select Input</Label>
//           <Select
//             options={options}
//             placeholder="Select an option"
//             onChange={handleSelectChange}
//             className="dark:bg-dark-900"
//           />
//         </div>
//         <div>
//           <Label>Password Input</Label>
//           <div className="relative">
//             <Input
//               type={showPassword ? "text" : "password"}
//               placeholder="Enter your password"
//             />
//             <button
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-4 top-1/2 z-30 -translate-y-1/2 cursor-pointer"
//             >
//               {showPassword ? (
//                 <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
//               ) : (
//                 <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
//               )}
//             </button>
//           </div>
//         </div>
//         <div>
//           <Label htmlFor="datePicker">Date Picker Input</Label>
//           <div className="flatpickr-wrapper relative w-full">
//             <Flatpickr
//               value={dateOfBirth} // Set the value to the state
//               onChange={handleDateChange} // Handle the date change
//               options={{
//                 dateFormat: "Y-m-d", // Set the date format
//               }}
//               placeholder="Select an option"
//               className="shadow-theme-xs focus:outline-hidden focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
//             />
//             <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
//               <CalenderIcon className="size-6" />
//             </span>
//           </div>
//         </div>
//         <div>
//           <Label htmlFor="tm">Date Picker Input</Label>
//           <div className="relative">
//             <Input
//               type="time"
//               id="tm"
//               name="tm"
//               onChange={(e) => console.log(e.target.value)}
//             />
//             <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
//               <TimeIcon className="size-6" />
//             </span>
//           </div>
//         </div>
//         <div>
//           <Label htmlFor="tm">Input with Payment</Label>
//           <div className="relative">
//             <Input
//               type="text"
//               placeholder="Card number"
//               className="pl-[62px]"
//             />
//             <span className="absolute left-0 top-1/2 flex h-11 w-[46px] -translate-y-1/2 items-center justify-center border-r border-gray-200 dark:border-gray-800">
//               <svg
//                 width="20"
//                 height="20"
//                 viewBox="0 0 20 20"
//                 fill="none"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <circle cx="6.25" cy="10" r="5.625" fill="#E80B26" />
//                 <circle cx="13.75" cy="10" r="5.625" fill="#F59D31" />
//                 <path
//                   d="M10 14.1924C11.1508 13.1625 11.875 11.6657 11.875 9.99979C11.875 8.33383 11.1508 6.8371 10 5.80713C8.84918 6.8371 8.125 8.33383 8.125 9.99979C8.125 11.6657 8.84918 13.1625 10 14.1924Z"
//                   fill="#FC6020"
//                 />
//               </svg>
//             </span>
//           </div>
//         </div>
//       </div>
//     </ComponentCard>
//   );
// }
