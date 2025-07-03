"use client";
import { Button } from "@/components/ui/button";
import React, { useContext, useEffect, useState } from "react";
import {
  HiMiniSquares2X2,
  HiLightBulb,
  HiClipboardDocumentCheck,
} from "react-icons/hi2";
import SelectCategory from "./_components/SelectCategory";
import TopicDescription from "./_components/TopicDescription";
import SelectOptions from "./_components/SelectOptions";
import { UserInputContext } from "../_context/UserInputContext";
import { GenerateCourseLayout_AI } from "@/configs/AiModel";
import LoadingDialog from "./_components/LoadingDialog";
import { db } from "@/configs/db";
import { courselist } from "@/configs/schema";
import uuid4 from "uuid4";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

function CreateCourse() {
  const StepperOptions = [
    {
      id: 1,
      name: "Category",
      icon: <HiMiniSquares2X2 />,
    },
    {
      id: 2,
      name: "Topic & Desc",
      icon: <HiLightBulb />,
    },
    {
      id: 3,
      name: "Options",
      icon: <HiClipboardDocumentCheck />,
    },
  ];

  const [loading, setLoading] = useState(false);

  const { userCourseInput, setUserCourseInput } = useContext(UserInputContext);

  const [activeIndex, setActiveIndex] = useState(0);
  const { user } = useUser();
  const { toast } = useToast();

  /**
   *  Used to check Next Button enabled or disabled
   */

  const checkStatus = () => {
    if (
      activeIndex === 0 &&
      (!userCourseInput?.category || userCourseInput?.category == "Others")
    )
      return true;
    if (activeIndex === 1 && !userCourseInput?.topic) return true;
    if (
      activeIndex === 2 &&
      (!userCourseInput?.level ||
        !userCourseInput?.displayVideo ||
        !userCourseInput?.noOfChapters ||
        !userCourseInput?.duration ||
        userCourseInput.noOfChapters < 1 ||
        userCourseInput.noOfChapters > 20)
    )
      return true;

    return false;
  };

  const router = useRouter();

  const SaveCourseLayoutInDB = async (courseLayout) => {
    try {
      console.log("=== Debug: SaveCourseLayoutInDB ===");
      console.log("Step 1: Starting database save operation...");

      // Validate course layout passed from AI
      if (!courseLayout) {
        throw new Error("Course layout is undefined or null");
      }
      console.log("Step 2: Course layout exists");

      // Validate required user input
      if (!userCourseInput) {
        throw new Error("User course input is undefined");
      }
      console.log("Step 3: User course input found:", {
        topic: userCourseInput.topic,
        category: userCourseInput.category,
        level: userCourseInput.level,
        displayVideo: userCourseInput.displayVideo,
      });

      // Validate user data
      if (!user?.primaryEmailAddress?.emailAddress) {
        throw new Error("User email is required");
      }
      console.log("Step 4: User data validated");

      // Generate a unique course ID
      const id = uuid4();
      console.log("Step 5: Generated course ID:", id);

      // Prepare the payload matching your schema exactly.
      // Note: Make sure the keys exactly match those declared in your schema.
      const payload = {
        courseId: id, // VARCHAR (from uuid4)
        name: userCourseInput.topic || "",
        category: userCourseInput.category || "",
        level: userCourseInput.level || "",
        includeVideo: userCourseInput.displayVideo ? "Yes" : "No",
        courseOutput: courseLayout, // JSON type column
        createdBy: user.primaryEmailAddress.emailAddress,
        username: user.fullName || "",
        userProfileImage: user.imageUrl || "",
        // courseBanner and publish will use defaults defined in the schema
      };
      console.log("Step 6: Prepared payload:", payload);

      console.log("Step 7: Inserting into DB...");
      // Insert the payload using drizzle. Ensure that the table definition (courselist)
      // is created using pgTable (as shown in your schema for Chapters) so that drizzle
      // can properly read and match column definitions.
      const result = await db.insert(courselist).values(payload);
      console.log("Step 8: Database insertion successful:", result);

      console.log("Step 9: Navigating to course page...");
      router.replace(`/create-course/${id}`);

    } catch (error) {
      console.error("=== Debug: Database Error ===");
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        data: {
          courseLayout: Boolean(courseLayout),
          userInput: Boolean(userCourseInput),
          userData: Boolean(user)
        }
      });
      toast({
        variant: "destructive",
        duration: 3000,
        title: "Database Error",
        description: error.message || "Failed to save course layout",
      });
      throw error;
    }
  };

  const GenerateCourseLayout = async () => {
    try {
      setLoading(true);
      console.log("=== Debug: GenerateCourseLayout ===");
      console.log("1. Starting course generation...");

      const BASIC_PROMPT = "Generate A Course Tutorial on Following Details With field as Course Name, Description, Along with Chapter Name, about, Duration : \n";
      const USER_INPUT_PROMPT = `Category: ${userCourseInput?.category}, Topic: ${userCourseInput?.topic}, Level:${userCourseInput?.level},Duration:${userCourseInput?.duration},NoOfChapters:${userCourseInput?.noOfChapters}, in JSON format`;
      const FINAL_PROMPT = BASIC_PROMPT + USER_INPUT_PROMPT;
      
      console.log("2. Generated prompt:", FINAL_PROMPT);

      const result = await GenerateCourseLayout_AI.sendMessage(FINAL_PROMPT);
      console.log("3. AI response received");

      const parsedLayout = JSON.parse(result.response.text());
      console.log("4. Parsed course layout:", parsedLayout);

      await SaveCourseLayoutInDB(parsedLayout);
      console.log("5. Course saved successfully");

      toast({
        variant: "success",
        duration: 3000,
        title: "Success!",
        description: "Course layout generated and saved successfully!",
      });

    } catch (error) {
      console.error("=== Debug: Generation Error ===");
      console.error("Error details:", {
        message: error.message,
        stack: error.stack
      });

      toast({
        variant: "destructive",
        duration: 3000,
        title: "Generation Error",
        description: error.message || "Failed to generate course layout",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Stepper */}
      <div className="flex flex-col justify-center items-center mt-10">
        <h2 className="text-4xl text-primary font-medium">Create Course</h2>

        <div className="flex mt-10">
          {StepperOptions.map((item, index) => (
            <div className="flex items-center" key={item.id}>
              <div className="flex flex-col items-center w-[50px] md:w-[100px]">
                <div
                  className={`bg-gray-200 p-3 rounded-full text-white ${
                    activeIndex >= index && "bg-primary"
                  }`}
                >
                  {" "}
                  {item.icon}
                </div>
                <h2 className="hidden md:block md:text-sm">{item.name}</h2>
              </div>
              {index != StepperOptions?.length - 1 && (
                <div
                  className={`h-1 w-[50px] md:w-[100px] rounded-full lg:w-[170px] bg-gray-300 ${
                    activeIndex - 1 >= index && "bg-primary"
                  }
                `}
                ></div>
              )}
              <div>
      
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-10 md:px-20 lg:px-44 mt-10">
        {/* Components */}
        {activeIndex == 0 && <SelectCategory />}
        {activeIndex == 1 && <TopicDescription />}
        {activeIndex == 2 && <SelectOptions />}
        {/* Next and Previous Button */}

        <div className="flex justify-between mt-10 mb-20">
          <Button
            disabled={activeIndex == 0}
            variant="outline"
            onClick={() => setActiveIndex(activeIndex - 1)}
          >
            Previous
          </Button>
          {activeIndex != StepperOptions?.length - 1 && (
            <Button
              onClick={() => setActiveIndex(activeIndex + 1)}
              disabled={checkStatus()}
            >
              Next
            </Button>
          )}
          {activeIndex == StepperOptions?.length - 1 && (
            <Button
              disabled={checkStatus()}
              onClick={() => GenerateCourseLayout()}
            >
              Generate Course Layout
            </Button>
          )}
        </div>
      </div>
      <LoadingDialog loading={loading} />
    </div>
  );
}

export default CreateCourse;
