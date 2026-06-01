import { sleep } from "workflow";

export async function handleUserSignup(email) {
  "use workflow";

  // Simulate user creation
  console.log(`Creating user for: ${email}`);
  const user = { id: Date.now(), email }; 
  
  // Simulate sending welcome email
  console.log(`Sending welcome email to: ${email}`);

  // Suspend execution for 5 seconds
  await sleep("5s");

  // Simulate sending onboarding email
  console.log(`Sending onboarding email to: ${email}`);
  
  return { userId: user.id, status: "onboarded" };
}
