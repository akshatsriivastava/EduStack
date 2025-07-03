"use client";
import { db } from "@/configs/db";
import { courselist } from "@/configs/schema";
import React, { useEffect, useState } from "react";
import CourseCard from "../_components/CourseCard";
import { Button } from "@/components/ui/button";
import { desc, eq } from "drizzle-orm";
import { useToast } from "@/hooks/use-toast";

function Explore() {
  const [courselistData, setcourselistData] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    console.log("DEBUG: useEffect triggered on Explore mount");
    GetAllCourses();
  }, []); // set dependency array value to pageIndex if needed

  const GetAllCourses = async () => {
    console.log("DEBUG: GetAllCourses start...");
    try {
      console.log("DEBUG: Querying courses where publish = true");
      const result = await db
        .select()
        .from(courselist)
        .where(eq(courselist.publish, true))
        .orderBy(desc(courselist.id));

      console.log("DEBUG: Retrieved courses:", result);
      setcourselistData(result);
    } catch (error) {
      console.error("DEBUG: Error retrieving courses", error);
      toast({
        variant: "destructive",
        duration: 3000,
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
    } finally {
      console.log("DEBUG: Finished GetAllCourses");
    }
  };

  return (
    <div>
      <h2 className="font-bold text-3xl">Explore More Courses</h2>
      <p className="text-sm text-gray-500">
        Explore more projects built with AI by other users.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {courselistData.length > 0 ? (
          courselistData.map((course, index) => (
            <CourseCard
              key={index}
              course={course}
              refreshData={() => {
                console.log("DEBUG: Refreshing courses from CourseCard", course);
                GetAllCourses();
              }}
              displayUser={true}
            />
          ))
        ) : (
          [1, 2, 3, 4, 5, 6].map((item, index) => (
            <div
              key={index}
              className="shadow-sm rounded-lg border p-2 mt-4 animate-pulse"
            >
              <div className="w-full h-[200px] bg-gray-300 rounded-lg"> </div>
              <div className="p-2">
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"> </div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"> </div>
                <div className="flex items-center justify-between">
                  <div className="h-6 bg-gray-300 rounded w-1/3"> </div>
                  <div className="h-6 bg-gray-300 rounded w-1/4"> </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Explore;
