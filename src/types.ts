export interface Operator {
  firstName: string;
  lastName: string;
  opsCompleted: number;
  reliability: number;
  endorsements: number;
}

export interface Op {
  opTitle: string;
  publicId: string;
  operatorsNeeded: number;
  startTime: string;
  endTime: string;
  operators: Operator[];
}