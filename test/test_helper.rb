ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    # Add more helper methods to be used by all tests here...
    def create_session_for(user)
      post "/login", params: { username: user.username, password: user.password }, as: :json
      assert_response :created
      assert_equal "Session created", response.body
    end

    def logout_session
      delete "/logout"
      assert_response :ok
      assert_equal "Session closed", response.body
    end
  end
end
