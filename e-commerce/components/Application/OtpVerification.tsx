  import { zSchema } from "@/lib/zodSchema";
  import { zodResolver } from "@hookform/resolvers/zod";
  import { useForm } from "react-hook-form";
  import ButtonLoading from "./ButtonLoading";
  import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
  import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";

  const REGEXP_ONLY_DIGITS_AND_CHARS = /^[0-9a-zA-Z]*$/;

  const OtpVerification = ({ email, onSubmit, loading }) => {
    const formSchema = zSchema.pick({
      otp: true,
      email: true
    });

    const form = useForm({
      resolver: zodResolver(formSchema),
      defaultValues: {
        otp: "",
        email: email
      }
    });

    const handleOtpVerification = async (values) => {
      if (onSubmit) {
        onSubmit(values);
      }
    };

    return (
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleOtpVerification)}>
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem className="mb-3">
                  <FormLabel>OTP</FormLabel>
                  <FormControl>
                    <InputOTP {...field} maxLength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-4">
              <ButtonLoading
                type="submit"
                text="Login"
                loading={loading}
                className="w-full cursor-pointer"
              />
            </div>
          </form>
        </Form>
      </div>
    );
  };

  export default OtpVerification;
