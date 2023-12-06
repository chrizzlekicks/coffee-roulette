require "test_helper"

class UserMatchingJobTest < ActiveJob::TestCase
  setup do
    @job = UserMatchingJob.new
  end

  test 'it works' do
    assert_equal 'ello ello', @job.perform_now
  end
  # test "the truth" do
  #   assert true
  # end
end
