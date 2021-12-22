import { RenderStateStack } from '../src/RenderState';

const stack: RenderStateStack = new RenderStateStack();
stack.printCurrentStateInfo();

stack.save();
stack.lineWidth = 10;
stack.fillStyle = 'green';
stack.printCurrentStateInfo();
stack.restore();

stack.printCurrentStateInfo();