use axum::{
    extract::Path,
    http::StatusCode,
    response::{Html, Json},
    routing::{get, post},
    Router,
};
use include_dir::{include_dir, Dir};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use tower::ServiceBuilder;
use tower_http::{
    cors::{Any, CorsLayer},
    services::ServeDir,
};

// Embed the frontend build directory
static FRONTEND_DIR: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/frontend/dist");

#[derive(Serialize, Deserialize)]
struct HealthResponse {
    status: String,
    message: String,
    stack: String,
    time: String,
}

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::fmt::init();

    // Build our application with routes
    let app = Router::new()
        // API routes
        .route("/api/health", get(health_check))
        .route("/api/todos", get(get_todos).post(create_todo))
        .route("/api/todos/:id", post(update_todo))
        // Serve embedded frontend
        .fallback(serve_frontend)
        .layer(
            ServiceBuilder::new()
                .layer(CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any))
        );

    // Run the server
    let addr = SocketAddr::from(([0, 0, 0, 0], {{PORT}}));
    tracing::info!("Rust + Axum server listening on {}", addr);
    
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health_check() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok".to_string(),
        message: "Rust + Axum backend is healthy!".to_string(),
        stack: "Rust + Axum".to_string(),
        time: chrono::Utc::now().to_rfc3339(),
    })
}

async fn get_todos() -> Json<Vec<Todo>> {
    // Mock data - in real app, this would come from Fireproof
    Json(vec![
        Todo {
            id: "1".to_string(),
            text: "Welcome to {{PROJECT_NAME}}!".to_string(),
            done: false,
            created: chrono::Utc::now().timestamp(),
        },
    ])
}

async fn create_todo(Json(payload): Json<CreateTodoRequest>) -> Json<Todo> {
    Json(Todo {
        id: uuid::Uuid::new_v4().to_string(),
        text: payload.text,
        done: false,
        created: chrono::Utc::now().timestamp(),
    })
}

async fn update_todo(Path(id): Path<String>, Json(payload): Json<UpdateTodoRequest>) -> Json<Todo> {
    Json(Todo {
        id,
        text: payload.text,
        done: payload.done,
        created: chrono::Utc::now().timestamp(),
    })
}

async fn serve_frontend(uri: axum::http::Uri) -> Result<Html<&'static str>, StatusCode> {
    let path = uri.path().trim_start_matches('/');
    
    if path.is_empty() || path == "index.html" {
        return Ok(Html(include_str!("../../frontend/dist/index.html")));
    }
    
    // Try to serve other files from embedded directory
    if let Some(file) = FRONTEND_DIR.get_file(path) {
        let content = file.contents_utf8().unwrap_or("");
        return Ok(Html(content));
    }
    
    // Fallback to index.html for SPA routing
    Ok(Html(include_str!("../../frontend/dist/index.html")))
}

#[derive(Serialize, Deserialize)]
struct Todo {
    id: String,
    text: String,
    done: bool,
    created: i64,
}

#[derive(Deserialize)]
struct CreateTodoRequest {
    text: String,
}

#[derive(Deserialize)]
struct UpdateTodoRequest {
    text: String,
    done: bool,
}
