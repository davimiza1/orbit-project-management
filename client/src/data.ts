import type { Task } from './types';

export const tasks: Task[] = [
  { id:'1', title:'Redesign pricing page', description:'Update copy, layout and visuals based on user feedback.', status:'backlog', priority:'Low', label:'Marketing', assignee:'Daniel Park', due:'Apr 22', comments:4 },
  { id:'2', title:'Blog CMS improvements', description:'Make it easier for the team to publish and manage content.', status:'backlog', priority:'Medium', label:'Engineering', assignee:'Priya Shah', due:'Apr 28', comments:2 },
  { id:'3', title:'Add multi-language support', description:'Support at least FR, DE and ES for initial launch.', status:'backlog', priority:'Low', label:'Product', assignee:'Daniel Park', due:'May 6', comments:1 },
  { id:'4', title:'Refine onboarding flow', description:'Simplify the sign-up experience and add a product tour to help new users get value faster. Focus on reducing friction in the first three steps.', status:'in-progress', priority:'High', label:'Product', assignee:'Maya Chen', due:'Apr 24', comments:6, checklist:[{text:'Map current user flow',done:true},{text:'Define new flow and screens',done:true},{text:'Design in Figma',done:true},{text:'Implement in React',done:false},{text:'QA and gather feedback',done:false}] },
  { id:'5', title:'Build new homepage', description:'Implement the new design in React and make it responsive.', status:'in-progress', priority:'High', label:'Engineering', assignee:'Leo Martin', due:'Apr 26', comments:3 },
  { id:'6', title:'Set up analytics events', description:'Track key conversion events in Amplitude.', status:'in-progress', priority:'Medium', label:'Data', assignee:'Noah Williams', due:'May 1', comments:2 },
  { id:'7', title:'Update brand assets', description:'New logo, colors and illustrations for the new site.', status:'in-review', priority:'Medium', label:'Design', assignee:'Maya Chen', due:'Apr 20', comments:3 },
  { id:'8', title:'Improve SEO metadata', description:'Update meta titles, descriptions and open graph tags.', status:'in-review', priority:'Medium', label:'Marketing', assignee:'Daniel Park', due:'Apr 23', comments:2 },
  { id:'9', title:'A/B test hero section', description:'Test two variants with different value propositions.', status:'in-review', priority:'Low', label:'Growth', assignee:'Priya Shah', due:'Apr 25', comments:4 },
  { id:'10', title:'Set up design system', description:'Components, tokens and guidelines in Figma.', status:'done', priority:'Low', label:'Design', assignee:'Leo Martin', due:'Apr 12', comments:5 },
  { id:'11', title:'Migrate to new hosting', description:'Move site to Vercel and configure redirects.', status:'done', priority:'Medium', label:'Engineering', assignee:'Daniel Park', due:'Apr 14', comments:2 },
  { id:'12', title:'Conduct user interviews', description:'Talk to 8 customers about the new design direction.', status:'done', priority:'Low', label:'Research', assignee:'Maya Chen', due:'Apr 17', comments:4 }
];
