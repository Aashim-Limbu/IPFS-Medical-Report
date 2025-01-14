import MaxWidthWrapper from "./MaxWidthWrapper";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";

const Features = () => {
  return (
    <section className="bg-[#f9f7f8] py-20">
      <MaxWidthWrapper>
        <div className="text-center  ">
          <h1>The App Features</h1>
          <p className="text-muted-foreground">
            Here are the main points you need to know about MedRepo:
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 place-items-center items-center gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="min-h-[350px] max-w-[350px] transition-all hover:shadow-2xl">
            <CardHeader>
              <Image
                src="/assets/lock.jpeg"
                alt="loading lock"
                width={90}
                height={30}
              />
              <CardTitle className="py-1 text-2xl">
                Privacy protection{" "}
              </CardTitle>
              <CardDescription className="pb-2">
                Deploy your new project in one-click. Lorem ipsum dolor sit amet
                consectetur adipisicing elit. Quas, hic odio dolor debitis id
                minima suscipit explicabo ut repellendus.
              </CardDescription>
            </CardHeader>
          </Card>{" "}
          <Card className="min-h-[350px] max-w-[350px] transition-all hover:shadow-2xl">
            <CardHeader>
              <Image
                src="/assets/lock.jpeg"
                alt="loading lock"
                width={90}
                height={30}
              />
              <CardTitle className="py-1 text-2xl">
                Privacy protection{" "}
              </CardTitle>
              <CardDescription className="pb-2">
                Deploy your new project in one-click. Lorem ipsum dolor sit amet
                consectetur adipisicing elit. Quas, hic odio dolor debitis id
                minima suscipit explicabo ut repellendus.
              </CardDescription>
            </CardHeader>
          </Card>{" "}
          <Card className="min-h-[350px] max-w-[350px] transition-all hover:shadow-2xl">
            <CardHeader>
              <Image
                src="/assets/lock.jpeg"
                alt="loading lock"
                width={90}
                height={30}
              />
              <CardTitle className="py-1 text-2xl">
                Privacy protection{" "}
              </CardTitle>
              <CardDescription className="pb-2">
                Deploy your new project in one-click. Lorem ipsum dolor sit amet
                consectetur adipisicing elit. Quas, hic odio dolor debitis id
                minima suscipit explicabo ut repellendus.
              </CardDescription>
            </CardHeader>
          </Card>{" "}
          <Card className="min-h-[350px] max-w-[350px] transition-all hover:shadow-2xl">
            <CardHeader>
              <Image
                src="/assets/lock.jpeg"
                alt="loading lock"
                width={90}
                height={30}
              />
              <CardTitle className="py-1 text-2xl">
                Privacy protection{" "}
              </CardTitle>
              <CardDescription className="pb-2">
                Deploy your new project in one-click. Lorem ipsum dolor sit amet
                consectetur adipisicing elit. Quas, hic odio dolor debitis id
                minima suscipit explicabo ut repellendus.
              </CardDescription>
            </CardHeader>
          </Card>{" "}
          <Card className="min-h-[350px] max-w-[350px] transition-all hover:shadow-2xl">
            <CardHeader>
              <Image
                src="/assets/lock.jpeg"
                alt="loading lock"
                width={90}
                height={30}
              />
              <CardTitle className="py-1 text-2xl">
                Privacy protection{" "}
              </CardTitle>
              <CardDescription className="pb-2">
                Deploy your new project in one-click. Lorem ipsum dolor sit amet
                consectetur adipisicing elit. Quas, hic odio dolor debitis id
                minima suscipit explicabo ut repellendus.
              </CardDescription>
            </CardHeader>
          </Card>{" "}
          <Card className="min-h-[350px] max-w-[350px] transition-all hover:shadow-2xl">
            <CardHeader>
              <Image
                src="/assets/lock.jpeg"
                alt="loading lock"
                width={90}
                height={30}
              />
              <CardTitle className="py-1 text-2xl">
                Privacy protection{" "}
              </CardTitle>
              <CardDescription className="pb-2">
                Deploy your new project in one-click. Lorem ipsum dolor sit amet
                consectetur adipisicing elit. Quas, hic odio dolor debitis id
                minima suscipit explicabo ut repellendus.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </MaxWidthWrapper>
    </section>
  );
};

export default Features;
