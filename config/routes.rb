Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html
  resources :users, only: [:index, :create, :show]

  put "users" => "users#update"
  delete "users" => "users#destroy"

  post "password/reset" => "password_resets#create"
  put "password/reset" => "password_resets#update"

  post "login" => "sessions#create"
  delete "logout" => "sessions#destroy"

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
end
