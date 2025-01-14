import Image from "next/image";
import MaxWidthWrapper from "./MaxWidthWrapper";
const Showoff = () => {
  return (
    <section className="my-10">
      <MaxWidthWrapper>
        <div className="flex justify-center gap-4">
          <div className="flex flex-col justify-center gap-4 px-6  py-8 ">
            <Image
              src="/assets/doctor.jpeg"
              width={120}
              height={20}
              alt={"loading doctor"}
            />
            <div>
              <h1 className="text-center text-primary">1000</h1>
              <p className=" text-center font-semibold md:text-left">
                Registered doctors
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-4 px-6  py-8 ">
            <Image
              src="/assets/hospital.jpeg"
              width={120}
              height={20}
              alt={"loading hopital"}
            />
            <div>
              <h1 className="text-center text-primary ">100</h1>
              <p className="text-center font-semibold md:text-left">
                Registered hospitals
              </p>{" "}
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
};

export default Showoff;
