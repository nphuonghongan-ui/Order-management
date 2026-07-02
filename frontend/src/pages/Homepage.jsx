import React from "react";
import Header from "@/components/Header";
import AddTask from "@/components/Addtask";
import StatsAndFilters from "@/components/StatsAndFilters";
import TaskList from "@/components/TaskList";
import TaskListPagination from "@/components/TaskListPag";
import DateTimeFilter from "@/components/DateTimeFilter";
import Footer from "@/components/Footer";
import PO from "@/components/PO";

const Homepage = () => {

  return (

<div className="min-h-screen w-full relative">
  {/* Radial Gradient Background */}
  <div
    className="absolute inset-0 z-0"
    style={{
      background: "radial-gradient(125% 125% at 50% 10%, #fff 40%, #6366f1 100%)",
    }}
  />
     {/* Your Content/Components */}

   <div className="container relative z-10 pt-8 mx-auto relative z-10">
        <div className="w-full max-w-2xl p-6 mx-auto space-y-6">

          <Header/>

          <AddTask/>

          <StatsAndFilters/>

          <TaskList/>

      <div className="flex flex-col items-center justify-between gap-6 sm:flex-row"></div>
          
          <TaskListPagination/>

          <DateTimeFilter/>
        
      </div>
          
          <Footer/>


      </div>
    </div>
 
  );
};

export default Homepage;