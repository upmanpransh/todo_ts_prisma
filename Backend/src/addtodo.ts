import { PrismaClient } from "@prisma/client";
const prisma= new PrismaClient;

async function insertTodo(user_id:number,title:string,description:string){
    await prisma.todo.create({
        data:{
            title,
            description,
            user_id
        },
    });
}

module.exports={
    insertTodo
}