export interface UserProps {
  isLogin: boolean;
  name?: string;
  id?: number;
}

export interface ColumnProps {
  id: number;
  title: string;
  avatar?: string;
  description: string;
}
interface RuleProp {
  type: 'required' | 'email' | 'custom';
  message: string;
  validator?: () => boolean;

}
export type RulesProp = RuleProp[]
