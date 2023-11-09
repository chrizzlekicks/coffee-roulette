class UsersController < ApplicationController
  def index
    @users = User.all
    render json: @users
  end

  def show
    @user = User.find(params[:id])

    if @user
      render json: @user, status: :ok
    else
      render json: 'Error', status: :not_found
    end
  end

  def create
    @user = User.create!(user_params)

    if @user
      render json: @user, status: :created
    else
      render json: 'Please provide proper name and email', status: :bad_request
    end
  end

  def destroy
    @user = User.destroy(params[:id])

    if @user.destroy
      render json: 'Success', status: :ok
    else
      render json: 'Error', status: :not_found
    end
  end

  private

  def user_params
    params.require(:user).permit(:email, :name)
  end
end
