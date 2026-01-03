
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:password@localhost:5432/upcycle_db",
)

engine = create_async_engine(DATABASE_URL, echo=False, future=True)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def get_session():
    async with AsyncSessionLocal() as session:
        yield session


async def test_connection():
    print("Checking connection...")
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        print("ok connected")
    except Exception as e:
        error_msg = str(e)
        if 'database "upcycle_db" does not exist' in error_msg or 'does not exist' in error_msg:
            print(f"Database missing ({error_msg}). Attempting to create...")
            try:
                # Import setup module dynamically to avoid top-level side effects if imported elsewhere
                import sys
                import os
                
                # Ensure the current directory is in sys.path so we can import setup
                current_dir = os.path.dirname(os.path.abspath(__file__))
                if current_dir not in sys.path:
                    sys.path.append(current_dir)
                
                import setup
                setup.main()
                print("Database created. Retrying connection...")
                
                # Retry connection
                async with engine.connect() as conn:
                    await conn.execute(text("SELECT 1"))
                print("ok connected")
                return
            except Exception as setup_error:
                print(f"Failed to auto-create database: {setup_error}")
        
        print(f"Connection failed: {e}")


if __name__ == "__main__":
    import asyncio
    from sqlalchemy import text
    # Fix for Windows SelectorEventLoop policy if needed, but standard run usually suffices
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        
    try:
        asyncio.run(test_connection())
    except KeyboardInterrupt:
        pass
