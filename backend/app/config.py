from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    app_secret_key: str = "development-only-change-me"
    database_url: str = "sqlite:///./dev.db"
    allowed_targets: str = ""
    workspace_root: str = "/workspace"
    master_key_file: str | None = None
    llm_base_url: str | None = None
    llm_model: str | None = None
    llm_api_key: str | None = None
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def allowed_target_list(self) -> set[str]:
        return {
            x.strip().rstrip("/") for x in self.allowed_targets.split(",") if x.strip()
        }


settings = Settings()
