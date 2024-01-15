require "test_helper"

class SessionsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(username: 'test', email: 'test@test.de', password: 'randompasswd')
  end

  test "does not create a session due to missing user" do
    post login_path, params: { username: "yolo", password: "banana" }

    assert_response :not_found
    assert_equal "User not found", response.body
  end

  test "fails due to invalid password" do
    post login_path, params: { username: @user.username, password: 'randompassword'}

    assert_response :bad_request
    assert_equal "Invalid password", response.body
  end

  test "start a new session and logout afterwards" do
    post login_path, params: { username: @user.username, password: @user.password }, as: :json

    assert_response :created
    assert_equal "Session created", response.body

    delete logout_path

    assert_response :ok
    assert_equal "Session closed", response.body
  end

  test "does not log out if no user is signed in" do
    delete logout_path

    assert_response :unauthorized
    assert_equal "User is not logged in", response.body
  end
end
