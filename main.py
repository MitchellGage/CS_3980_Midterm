import uvicorn
from fastapi import FastAPI, APIRouter, status, Path
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel

task_list = []


class Task(BaseModel):
    title: str
    description: str
    time: str


app = FastAPI()


@app.post("/tasks", status_code=status.HTTP_201_CREATED)
async def add_task(task: Task) -> dict:
    task_list.append(task)
    json_compatible_item_data = task.model_dump()
    return JSONResponse(json_compatible_item_data, status_code=status.HTTP_201_CREATED)


@app.get("/tasks")
async def get_tasks() -> dict:
    json_compatible_item_data = jsonable_encoder(task_list)
    return JSONResponse(content=json_compatible_item_data)


@app.get("/tasks/{title}")
async def get_task_by_title(title: str = Path(..., title="default")) -> dict:
    for task in task_list:
        if task.title == title:
            return {"task": task}


@app.put("/tasks/{title}")
async def update_task(task: Task, title: str) -> dict:
    for x in task_list:
        if x.title == title:
            x.title = task.title
            x.description = task.description
            x.time = task.time
            return {"message": "Task updated"}


@app.delete("/tasks/{title}")
async def delete_task(title: str) -> dict:
    for i in range(len(task_list)):
        task = task_list[i]
        if task.title == title:
            task_list.pop(i)
            return {"message": f"{title} deleted."}


@app.get("/")
async def read_index():
    return FileResponse("./frontend/index.html")


app.include_router(APIRouter())

app.mount("/", StaticFiles(directory="frontend"), name="static")
